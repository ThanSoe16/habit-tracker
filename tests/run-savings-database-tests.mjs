import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync, spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const url = process.env.ACCOUNT_TEST_DATABASE_URL;
assert.ok(url, 'Set ACCOUNT_TEST_DATABASE_URL to an empty disposable local database.');
const parsed = new URL(url);
assert.ok(
  ['localhost', '127.0.0.1'].includes(parsed.hostname) &&
    parsed.pathname.startsWith('/habit_account_'),
);
const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const goal = '33333333-3333-4333-8333-333333333333';
function sql(source, failure = false) {
  const result = spawnSync('psql', [url, '-X', '-v', 'ON_ERROR_STOP=1', '-At'], {
    input: source,
    encoding: 'utf8',
  });
  if (failure) assert.notEqual(result.status, 0, 'Expected database denial');
  else assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
const asUser = (source, user = owner) =>
  `SET ROLE authenticated; SET request.jwt.claim.sub = '${user}'; ${source}`;
const transaction = (id, kind, amount, budget = false, goalId = goal) =>
  `SELECT balance FROM public.record_savings_transaction('${id}','${goalId}','${kind}',${amount},'Mom','test',${budget});`;
const id = (number) => `aaaaaaaa-aaaa-4aaa-8aaa-${String(number).padStart(12, '0')}`;
assert.equal(sql("SELECT count(*) FROM pg_tables WHERE schemaname='public';"), '0');
sql(
  readFileSync('supabase/tests/bootstrap.sql', 'utf8') +
    '\n' +
    `INSERT INTO auth.users(id,email) VALUES ('${owner}','owner@example.test'),('${other}','other@example.test');\n` +
    `SET app.legacy_owner_id = '${owner}';\n` +
    readdirSync('supabase/migrations')
      .sort()
      .map((name) => readFileSync(`supabase/migrations/${name}`, 'utf8'))
      .join('\n'),
);
sql(
  asUser(`SELECT public.create_savings_goal('${goal}','Mom savings','MMK',100,NULL,'either','');`),
);
sql(
  asUser(`SELECT public.create_savings_goal('${goal}','Mom savings','MMK',100,NULL,'either','');`),
);
assert.equal(sql(asUser('SELECT count(*) FROM savings_goals;')).split('\n').at(-1), '1');
const walletBefore = sql(asUser("SELECT balance FROM current_budget WHERE currency='MMK';"))
  .split('\n')
  .at(-1);
sql(asUser(transaction(id(1), 'deposit', 50)));
sql(asUser(transaction(id(2), 'withdrawal', 10)), true);
sql(asUser(transaction(id(3), 'deposit', 50)));
sql(asUser(transaction(id(3), 'deposit', 50))); // Idempotent retry.
assert.equal(sql(asUser('SELECT balance FROM savings_goals;')).split('\n').at(-1), '100');
assert.equal(
  sql(asUser("SELECT balance FROM current_budget WHERE currency='MMK';")).split('\n').at(-1),
  walletBefore,
);
sql(asUser(transaction(id(4), 'withdrawal', 40, true)));
sql(asUser(transaction(id(4), 'withdrawal', 40, true)));
assert.equal(
  Number(
    sql(asUser("SELECT balance FROM current_budget WHERE currency='MMK';")).split('\n').at(-1),
  ),
  Number(walletBefore) + 40,
);
assert.equal(
  sql(asUser("SELECT count(*) FROM incomes WHERE category='Savings';")).split('\n').at(-1),
  '1',
);
sql(asUser(transaction(id(5), 'withdrawal', 10))); // Remains unlocked below target.
assert.equal(sql(asUser('SELECT balance FROM savings_goals;')).split('\n').at(-1), '50');
sql(asUser(transaction(id(6), 'withdrawal', 51)), true);
for (const amount of ['0', '-1', '0.001', "'NaN'::numeric", '1000000000001'])
  sql(asUser(transaction(id(7), 'deposit', amount)), true);
sql(asUser(transaction(id(8), 'deposit', 10, true)), true);
sql(asUser(transaction(id(4), 'withdrawal', 20, true)), true);
console.log(
  'PASS: deposits stay separate; target lock, partial withdrawals, precision, balance limits, retries, atomic wallet/income credit',
);

// All direct writes denied, including protected fields and ledger deletion.
for (const source of [
  `UPDATE savings_goals SET balance=999;`,
  `UPDATE savings_goals SET user_id='${other}';`,
  `UPDATE savings_goals SET target_amount=1;`,
  'DELETE FROM savings_goals;',
  'DELETE FROM savings_transactions;',
  `UPDATE savings_transactions SET amount=1;`,
  `INSERT INTO savings_goals(id,name,currency,target_amount,unlock_rule) VALUES ('${id(50)}','x','MMK',1,'either');`,
  `INSERT INTO savings_transactions(id,goal_id,kind,amount) VALUES ('${id(51)}','${goal}','deposit',1);`,
])
  sql(asUser(source), true);
assert.equal(sql(asUser('SELECT count(*) FROM savings_goals;', other)).split('\n').at(-1), '0');
assert.equal(
  sql(asUser('SELECT count(*) FROM savings_transactions;', other)).split('\n').at(-1),
  '0',
);
sql(asUser(transaction(id(9), 'deposit', 10), other), true);
sql(asUser(transaction(id(9), 'withdrawal', 10), other), true);
sql(`SET ROLE anon; SELECT * FROM savings_goals;`, true);
sql(`SET ROLE anon; ${transaction(id(9), 'deposit', 10)}`, true);
sql(`SET ROLE authenticated; ${transaction(id(9), 'deposit', 10)}`, true);
assert.equal(sql(`SELECT balance FROM savings_goals WHERE id='${goal}';`), '50');
assert.equal(sql(`SELECT user_id FROM savings_goals WHERE id='${goal}';`), owner);
console.log(
  'PASS: owner reads; cross-owner/anonymous denial; protected ownership, rules, balance and history remain unchanged',
);

// UTC date boundaries, either/both combinations, and form-bypassing constraints.
for (const [n, target, date, rule, allowed] of [
  [20, 'NULL', "(now() AT TIME ZONE 'UTC')::date", 'either', true],
  [21, 'NULL', "(now() AT TIME ZONE 'UTC')::date + 1", 'either', false],
  [22, '100', "(now() AT TIME ZONE 'UTC')::date + 1", 'either', true],
  [23, '100', "(now() AT TIME ZONE 'UTC')::date + 1", 'both', false],
  [24, '100', "(now() AT TIME ZONE 'UTC')::date", 'both', true],
  [25, '200', "(now() AT TIME ZONE 'UTC')::date", 'either', true],
  [26, '200', "(now() AT TIME ZONE 'UTC')::date", 'both', false],
]) {
  sql(
    asUser(
      `SELECT public.create_savings_goal('${id(n)}','date rule','THB',${target},${date},'${rule}','');`,
    ),
  );
  sql(asUser(transaction(id(n + 100), 'deposit', 100, false, id(n))));
  sql(asUser(transaction(id(n + 200), 'withdrawal', 1, false, id(n))), !allowed);
}
for (const args of [
  "'x','MMK',NULL,NULL,'either',''",
  "'x','BAD',1,NULL,'either',''",
  "'','MMK',1,NULL,'either',''",
  "'x','MMK',-1,NULL,'either',''",
]) {
  sql(asUser(`SELECT public.create_savings_goal('${id(99)}',${args});`), true);
}
console.log(
  'PASS: UTC date boundary, amount-only/date-only/either/both rules and database input constraints',
);

// Two competing withdrawals cannot overdraw a pot.
function concurrent(source) {
  return new Promise((resolve) => {
    const process = spawn('psql', [url, '-X', '-v', 'ON_ERROR_STOP=1', '-At']);
    process.stdout.resume();
    process.stderr.resume();
    process.on('close', (code) => resolve(code));
    process.stdin.end(source);
  });
}
const results = await Promise.all([
  concurrent(asUser(transaction(id(300), 'withdrawal', 40))),
  concurrent(asUser(transaction(id(301), 'withdrawal', 40))),
]);
assert.equal(results.filter((code) => code === 0).length, 1);
assert.equal(sql(`SELECT balance FROM savings_goals WHERE id='${goal}';`), '10');
console.log('PASS: concurrent withdrawals serialize and cannot overdraw');
