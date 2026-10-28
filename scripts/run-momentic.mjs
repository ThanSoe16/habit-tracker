import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { createClient } from '@supabase/supabase-js';

const root = fileURLToPath(new URL('../', import.meta.url));
const authDir = path.join(root, 'e2e/.auth');
const cli = path.join(root, 'node_modules/momentic/bin/cli.js');
const args = process.argv.slice(2);
const forwarded = [];
let feature;
let parallel = '1';
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--feature') feature = args[++i];
  else if (args[i] === '--parallel') parallel = args[++i];
  else if (['--url-override', '--env'].includes(args[i]) && args[i + 1]) {
    forwarded.push(args[i], args[++i]);
  } else {
    throw new Error(
      'Use --feature <name>, --parallel <count>, --url-override <url>, or --env <name>.',
    );
  }
}
const features = [
  'access',
  'account',
  'budget',
  'goals',
  'habits',
  'media',
  'mood',
  'wellbeing',
  'workout',
  'fixtures',
];
if (feature && !features.includes(feature)) throw new Error(`Unknown feature: ${feature}`);
if (!/^[1-4]$/.test(parallel)) throw new Error('--parallel must be between 1 and 4.');
const local = parseEnv(await readFile(path.join(root, '.env.local'), 'utf8'));
const secrets = [
  local.E2E_LOGIN_EMAIL,
  local.E2E_LOGIN_PASSWORD,
  local.SUPABASE_SERVICE_ROLE_KEY,
].filter((value) => value && value.length > 2);
function redact(text) {
  for (const secret of secrets) text = text.split(secret).join('[REDACTED]');
  return text;
}
function run(testArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [cli, 'run', ...testArgs, ...forwarded, '--reporter', 'dot'],
      {
        cwd: root,
        env: { ...process.env, E2E_RUN_ID: runId },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    activeChild = child;
    for (const stream of [child.stdout, child.stderr]) {
      let pending = '';
      stream.setEncoding('utf8');
      stream.on('data', (chunk) => {
        pending += chunk;
        const lastNewline = pending.lastIndexOf('\n');
        if (lastNewline >= 0) {
          process.stdout.write(redact(pending.slice(0, lastNewline + 1)));
          pending = pending.slice(lastNewline + 1);
        }
      });
      stream.on('end', () => {
        if (pending) process.stdout.write(redact(pending));
      });
    }
    child.on('error', reject);
    child.on('close', (code) => {
      activeChild = undefined;
      resolve(code ?? 1);
    });
  });
}

// Use only the ordinary signed-in user's session and this run's exact fixture names.
// Cleanup runs even when a browser test fails before reaching its UI deletion steps.
async function cleanup() {
  if (!ranFixtures) return;
  const state = JSON.parse(await readFile(path.join(authDir, 'session.json'), 'utf8'));
  const tokenItem = state.origins
    .flatMap((origin) => origin.localStorage)
    .find((item) => /^sb-.+-auth-token$/.test(item.name));
  if (!tokenItem) throw new Error('Cannot clean fixtures: saved Supabase session is missing.');
  const token = JSON.parse(tokenItem.value);
  const client = createClient(
    local.NEXT_PUBLIC_SUPABASE_URL,
    local.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    },
  );
  const { data, error } = await client.auth.setSession({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
  });
  if (error || !data.user) throw new Error('Cannot authenticate fixture cleanup.');
  const removed = {};
  for (const [table, column, kind] of [
    ['habits', 'name', 'habit'],
    ['goals', 'title', 'goal'],
  ]) {
    const names = [`E2E ${runId} ${kind}`, `E2E ${runId} ${kind} edited`];
    const result = await client
      .from(table)
      .delete()
      .eq('user_id', data.user.id)
      .in(column, names)
      .select('id');
    if (result.error)
      throw new Error(`Could not clean this run's temporary ${table}. Run ID: ${runId}`);
    removed[table] = result.data.length;
    const check = await client
      .from(table)
      .select('id')
      .eq('user_id', data.user.id)
      .in(column, names);
    if (check.error || check.data.length)
      throw new Error(`Fixture cleanup could not be verified for ${table}.`);
  }
  console.log(
    `Fixture cleanup verified: ${removed.habits} remaining habits and ${removed.goals} remaining goals removed.`,
  );
}

const runId = randomUUID();
let activeChild;
let ranFixtures = false;
await mkdir(authDir, { recursive: true });
const lock = path.join(authDir, 'run.lock');
await writeFile(lock, String(process.pid), { flag: 'wx' });
await writeFile(
  path.join(authDir, 'last-run.json'),
  JSON.stringify({ runId, feature: feature ?? 'all' }, null, 2),
);
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    process.exitCode = 130;
    activeChild?.kill(signal);
  });
}
let exitCode = 1;
try {
  const setup = await run(['e2e-auth-setup.test.yaml', '--parallel', '1']);
  if (setup !== 0) exitCode = setup;
  else {
    const target = feature ? `e2e/pages/${feature}` : 'e2e/pages';
    ranFixtures = !feature || feature === 'fixtures';
    exitCode = await run([target, '--parallel', parallel]);
  }
} catch (error) {
  console.error(redact(error.message));
} finally {
  try {
    await cleanup();
  } catch (error) {
    console.error(redact(error.message));
    exitCode = 1;
  }
  await rm(lock, { force: true });
}
process.exitCode = process.exitCode || exitCode;
