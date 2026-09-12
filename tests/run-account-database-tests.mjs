import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const url = process.env.ACCOUNT_TEST_DATABASE_URL;
assert.ok(url, 'Set ACCOUNT_TEST_DATABASE_URL to an empty disposable local PostgreSQL database.');
const parsed = new URL(url);
assert.ok(
  ['localhost', '127.0.0.1'].includes(parsed.hostname) &&
    parsed.pathname.startsWith('/habit_account_'),
  'Use a local database named habit_account_*; never run this fixture on a hosted project.',
);
function sql(source, expectFailure = false) {
  const result = spawnSync('psql', [url, '-X', '-v', 'ON_ERROR_STOP=1', '-At'], {
    input: source,
    encoding: 'utf8',
  });
  if (expectFailure) {
    assert.notEqual(result.status, 0, 'Migration must refuse ambiguous ownership');
    assert.match(result.stderr, /Set app.legacy_owner_id/);
  } else {
    assert.equal(result.status, 0, result.stderr);
  }
  return result.stdout;
}
assert.equal(
  sql("SELECT count(*) FROM pg_tables WHERE schemaname = 'public';").trim(),
  '0',
  'Database must be empty',
);
const migrationPath = 'supabase/migrations/20260912000000_account_ownership.sql';
const migration = readFileSync(migrationPath, 'utf8');
const baseline = readdirSync('supabase/migrations')
  .sort()
  .filter((name) => name < '20260912000000_account_ownership.sql')
  .map((name) => readFileSync(`supabase/migrations/${name}`, 'utf8'))
  .join('\n');
sql(
  readFileSync('supabase/tests/bootstrap.sql', 'utf8') +
    '\n' +
    baseline +
    `
INSERT INTO auth.users(id,email) VALUES
 ('11111111-1111-4111-8111-111111111111','owner@example.test'),
 ('22222222-2222-4222-8222-222222222222','other@example.test');
INSERT INTO public.habits(id,name) VALUES ('legacy-habit','Original habit');
INSERT INTO storage.objects(bucket_id,name) VALUES ('media_store','store/legacy.jpg');
`,
);
sql('BEGIN;\n' + migration + '\nCOMMIT;', true);
console.log('PASS: missing legacy owner refuses migration without changing existing rows');
sql(
  `BEGIN; SET LOCAL app.legacy_owner_id = '11111111-1111-4111-8111-111111111111';\n${migration}\nCOMMIT;`,
);
assert.equal(
  sql("SELECT user_id FROM public.habits WHERE id='legacy-habit';").trim(),
  '11111111-1111-4111-8111-111111111111',
);
assert.equal(
  sql("SELECT count(*) FROM pg_policies WHERE schemaname='public' AND qual='true';").trim(),
  '0',
);
console.log('PASS: full migration chain and explicit legacy ownership');
sql(readFileSync('supabase/tests/account-ownership.sql', 'utf8'));
console.log(
  'PASS: own CRUD, cross-owner denial, natural key isolation, anonymous denial, protected ownership and constraints across 18 tables',
);
sql(readFileSync('supabase/tests/account-storage-and-push.sql', 'utf8'));
console.log(
  'PASS: private storage, push relations, signup provisioning, cascade, and privileged function restrictions',
);
