import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const url = process.env.ACCOUNT_TEST_DATABASE_URL;
assert.ok(url, 'Set ACCOUNT_TEST_DATABASE_URL to an empty disposable local database.');
const parsed = new URL(url);
assert.ok(
  ['localhost', '127.0.0.1'].includes(parsed.hostname) &&
    parsed.pathname.startsWith('/habit_account_'),
);

function sql(source, expectFailure = false) {
  const result = spawnSync('psql', [url, '-X', '-v', 'ON_ERROR_STOP=1', '-At'], {
    input: source,
    encoding: 'utf8',
  });
  if (expectFailure) assert.notEqual(result.status, 0, 'Expected database denial');
  else assert.equal(result.status, 0, result.stderr);
  return expectFailure ? result.stderr : result.stdout.trim();
}

const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const goalId = '33333333-3333-4333-8333-333333333333';
const changedId = '44444444-4444-4444-8444-444444444444';
const asUser = (source, user = owner) =>
  `SET ROLE authenticated; SET request.jwt.claim.sub = '${user}'; ${source}`;

assert.equal(sql("SELECT count(*) FROM pg_tables WHERE schemaname='public';"), '0');
sql(
  readFileSync('supabase/tests/bootstrap.sql', 'utf8') +
    `\nINSERT INTO auth.users(id,email) VALUES ('${owner}','owner@example.test'),('${other}','other@example.test');\n` +
    `SET app.legacy_owner_id = '${owner}';\n` +
    readdirSync('supabase/migrations')
      .sort()
      .map((name) => readFileSync(`supabase/migrations/${name}`, 'utf8'))
      .join('\n'),
);

const insert = `INSERT INTO public.goals
  (id, title, why, target_date, target_amount, currency, places, sub_ideas, savings,
   status, completion_note, energy_score, completed_at, created_at, updated_at)
  VALUES ('${goalId}', 'Home', '', NULL, 300000000, 'MMK', '{}', '[]', '[]',
          'idea', '', NULL, NULL, now(), now()) RETURNING id;`;
assert.ok(sql(asUser(insert)).split('\n').includes(goalId));

const update = `UPDATE public.goals SET title = 'House', why = '', target_date = NULL,
  target_amount = 300000000, currency = 'MMK', places = '{}', sub_ideas = '[]',
  savings = '[]', status = 'idea', completion_note = '', energy_score = NULL,
  completed_at = NULL, updated_at = now()
  WHERE id = '${goalId}' AND user_id = '${owner}' RETURNING title;`;
assert.ok(sql(asUser(update)).split('\n').includes('House'));

assert.ok(
  !sql(
    asUser(`UPDATE public.goals SET title = 'Other' WHERE id = '${goalId}' RETURNING id;`, other),
  )
    .split('\n')
    .includes(goalId),
);
sql(asUser(`UPDATE public.goals SET id = '${changedId}' WHERE id = '${goalId}';`), true);
sql(asUser(`UPDATE public.goals SET created_at = now() WHERE id = '${goalId}';`), true);
sql('SET ROLE anon; SELECT id FROM public.goals;', true);
assert.equal(sql(`SELECT title FROM public.goals WHERE id = '${goalId}';`), 'House');
assert.equal(sql(`SELECT count(*) FROM public.goals WHERE id = '${changedId}';`), '0');

console.log(
  'PASS: goal inserts and editable updates work; owner, ID, and creation time stay protected',
);
