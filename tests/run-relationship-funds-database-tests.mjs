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
const id = '33333333-3333-4333-8333-333333333333';
function sql(source, failure = false) {
  const result = spawnSync('psql', [url, '-X', '-v', 'ON_ERROR_STOP=1', '-At'], {
    input: source,
    encoding: 'utf8',
  });
  if (failure) assert.notEqual(result.status, 0, 'Expected database denial');
  else assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim().split('\n').at(-1);
}
const asUser = (source, user = owner) =>
  `SET ROLE authenticated; SET request.jwt.claim.sub = '${user}'; ${source}`;
assert.equal(sql("SELECT count(*) FROM pg_tables WHERE schemaname='public';"), '0');
const upgrade = '20260915000002_relationship_fund_transactions.sql';
sql(
  readFileSync('supabase/tests/bootstrap.sql', 'utf8') +
    '\n' +
    `INSERT INTO auth.users(id,email) VALUES ('${owner}','owner@example.test'),('${other}','other@example.test');\n` +
    `SET app.legacy_owner_id = '${owner}';\n` +
    readdirSync('supabase/migrations')
      .sort()
      .filter((name) => name < upgrade)
      .map((name) => readFileSync(`supabase/migrations/${name}`, 'utf8'))
      .join('\n'),
);
// Legacy rows have no recorded person and must not move wallets during upgrade.
sql(
  asUser(
    `INSERT INTO relationship_fund_expenses(id,title,amount,date,note) VALUES ('${id}','Legacy dinner',50000,'2026-09-15','');`,
  ),
);
const walletsBefore = sql(
  'SELECT jsonb_agg(t) FROM (SELECT * FROM current_budget ORDER BY user_id,currency) t;',
);
sql(readFileSync(`supabase/migrations/${upgrade}`, 'utf8'));
assert.equal(
  sql('SELECT jsonb_agg(t) FROM (SELECT * FROM current_budget ORDER BY user_id,currency) t;'),
  walletsBefore,
);
assert.equal(
  sql(
    `SELECT kind || ',' || money_source || ',' || (person IS NULL)::text FROM relationship_fund_transactions;`,
  ),
  'spend,extra,true',
);
sql(asUser(`DELETE FROM relationship_fund_transactions WHERE id='${id}';`));
const table = 'relationship_fund_transactions';
const insert = (
  kind = 'save',
  source = 'current_budget',
  amount = 125000,
  person = 'TSO',
  txId = id,
) =>
  `INSERT INTO ${table}(id,title,amount,date,note,kind,person,money_source) VALUES ('${txId}','Together',${amount},'2026-09-15','','${kind}','${person}','${source}');`;
const wallet = () =>
  Number(sql(`SELECT balance FROM current_budget WHERE user_id='${owner}' AND currency='MMK';`));
sql(asUser("UPDATE current_budget SET balance=100000 WHERE currency='MMK';"));
const personalExpenses = sql('SELECT count(*) FROM expenses;');
const personalIncome = sql('SELECT count(*) FROM incomes;');
sql(asUser(insert()));
assert.equal(wallet(), 225000);
sql(asUser(insert()), true); // Duplicate UUID must not credit twice.
assert.equal(wallet(), 225000);
sql(asUser(`UPDATE ${table} SET amount=200000, person='Nway' WHERE id='${id}';`));
assert.equal(wallet(), 300000);
sql(asUser(`UPDATE ${table} SET amount=200000, person='Nway' WHERE id='${id}';`));
assert.equal(wallet(), 300000); // An identical retry has zero delta.
sql(asUser(`UPDATE ${table} SET kind='spend',amount=30000 WHERE id='${id}';`));
assert.equal(wallet(), 70000); // Reverse 200k saving, subtract 30k spending.
sql(asUser(`UPDATE ${table} SET money_source='extra' WHERE id='${id}';`));
assert.equal(wallet(), 100000);
sql(asUser(`UPDATE ${table} SET kind='save',amount=90000 WHERE id='${id}';`));
assert.equal(wallet(), 100000);
sql(asUser(`UPDATE ${table} SET money_source='current_budget' WHERE id='${id}';`));
assert.equal(wallet(), 190000);
sql(asUser(`DELETE FROM ${table} WHERE id='${id}';`));
assert.equal(wallet(), 100000);
for (const person of ['TSO', 'Nway'])
  for (const kind of ['save', 'spend'])
    for (const source of ['current_budget', 'extra']) {
      sql(asUser(insert(kind, source, 175000, person)));
      assert.equal(wallet(), source === 'extra' ? 100000 : kind === 'save' ? 275000 : -75000);
      sql(asUser(`DELETE FROM ${table} WHERE id='${id}';`));
      assert.equal(wallet(), 100000);
    }
console.log(
  'PASS: migration preserves old expenses; flexible TSO/Nway saves/spends; both money sources; create/edit/delete/retry exact wallet effects including negative balances',
);

sql(asUser(insert()));
assert.equal(sql(asUser(`SELECT count(*) FROM ${table};`, other)), '0');
sql(asUser(`UPDATE ${table} SET amount=1 WHERE id='${id}';`, other));
sql(asUser(`DELETE FROM ${table} WHERE id='${id}';`, other));
assert.equal(wallet(), 225000);
for (const source of [
  `UPDATE ${table} SET user_id='${other}';`,
  `UPDATE ${table} SET id=gen_random_uuid();`,
  `UPDATE ${table} SET created_at=now();`,
  `INSERT INTO ${table}(user_id,title,amount,date,kind,person,money_source) VALUES ('${other}','x',1,'2026-09-15','save','TSO','current_budget');`,
  `SELECT public.apply_relationship_fund_wallet_change();`,
])
  sql(asUser(source), true);
for (const amount of ['0', '-1', '0.1', "'NaN'::numeric", "'Infinity'::numeric", '1000000000001'])
  sql(asUser(`UPDATE ${table} SET amount=${amount};`), true);
for (const change of [
  "title=' '",
  "note=repeat('a',501)",
  "date='1899-12-31'",
  "date='2026-02-30'",
  "person='Other'",
  'person=NULL',
  "kind='income'",
  "money_source='unknown'",
])
  sql(asUser(`UPDATE ${table} SET ${change};`), true);
for (const source of [
  `SELECT * FROM ${table};`,
  insert(),
  `UPDATE ${table} SET amount=1;`,
  `DELETE FROM ${table};`,
])
  sql(`SET ROLE anon; ${source}`, true);
sql(`SET ROLE authenticated; ${insert('save', 'current_budget', 100, 'TSO', other)}`, true);
assert.equal(sql(`SELECT user_id FROM ${table};`), owner);
assert.equal(sql(`SELECT amount FROM ${table};`), '125000');
assert.equal(wallet(), 225000);
// A later transaction error rolls back both the ledger and the wallet trigger.
sql(asUser(`BEGIN; UPDATE ${table} SET amount=500000; SELECT 1/0; COMMIT;`), true);
assert.equal(wallet(), 225000);
assert.equal(sql(`SELECT amount FROM ${table};`), '125000');
sql(asUser(`DELETE FROM ${table} WHERE id='${id}';`));
assert.equal(wallet(), 100000);
assert.equal(sql('SELECT count(*) FROM expenses;'), personalExpenses);
assert.equal(sql('SELECT count(*) FROM incomes;'), personalIncome);
console.log(
  'PASS: owner CRUD; cross-account/anonymous denial; protected fields; invalid inputs leave wallets unchanged; transaction rollback; separate history',
);

// Concurrent independent contributions must add without lost wallet updates.
function concurrent(source) {
  return new Promise((resolve) => {
    const process = spawn('psql', [url, '-X', '-v', 'ON_ERROR_STOP=1', '-At']);
    process.stdout.resume();
    process.stderr.resume();
    process.on('close', resolve);
    process.stdin.end(source);
  });
}
const concurrentIds = [
  'aaaaaaaa-aaaa-4aaa-8aaa-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-222222222222',
];
const results = await Promise.all(
  concurrentIds.map((txId) =>
    concurrent(asUser(insert('save', 'current_budget', 12345, 'Nway', txId))),
  ),
);
assert.deepEqual(results, [0, 0]);
assert.equal(wallet(), 124690);
sql(`DELETE FROM auth.users WHERE id='${owner}';`);
assert.equal(sql(`SELECT count(*) FROM ${table} WHERE user_id='${owner}';`), '0');
console.log('PASS: concurrent contributions add exactly; account deletion cascade succeeds');
