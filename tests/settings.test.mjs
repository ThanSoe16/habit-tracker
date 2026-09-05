import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSaveQueue } from '../src/features/settings/save-queue.ts';
import { budgetBackupSchema, createBudgetBackup } from '../src/features/budget/utils/backup.ts';

const tick = () => new Promise((resolve) => setImmediate(resolve));

test('prevents overlapping saves and coalesces rapid edits to the newest snapshot', async () => {
  const writes = [];
  const releases = [];
  const statuses = [];
  const queue = createSaveQueue(
    (value) => {
      writes.push(value);
      return new Promise((resolve) => releases.push(resolve));
    },
    (status) => statuses.push(status),
  );
  queue.save('first');
  queue.save('second');
  queue.save('latest');
  assert.deepEqual(writes, ['first']);
  releases.shift()();
  await tick();
  assert.deepEqual(writes, ['first', 'latest']);
  assert.equal(queue.hasPending, true);
  releases.shift()();
  await tick();
  assert.equal(queue.hasPending, false);
  assert.equal(statuses.at(-1), 'saved');
});

test('keeps failed changes available for retry without claiming success', async () => {
  let fail = true;
  const writes = [];
  const statuses = [];
  const queue = createSaveQueue(
    async (value) => {
      writes.push(value);
      if (fail) throw new Error('Offline');
    },
    (status) => statuses.push(status),
  );
  queue.save({ name: 'New name' });
  await tick();
  assert.equal(statuses.at(-1), 'error');
  assert.equal(queue.hasPending, true);
  fail = false;
  queue.retry();
  await tick();
  assert.equal(statuses.at(-1), 'saved');
  assert.deepEqual(writes[0], writes[1]);
});

test('retries the newest edit when an older in-flight request fails', async () => {
  let rejectFirst;
  const writes = [];
  const queue = createSaveQueue(
    (value) => {
      writes.push(value);
      return writes.length === 1
        ? new Promise((_, reject) => {
            rejectFirst = reject;
          })
        : Promise.resolve();
    },
    () => {},
  );
  queue.save('old');
  queue.save('new');
  rejectFirst(new Error('Offline'));
  await tick();
  queue.retry();
  await tick();
  assert.deepEqual(writes, ['old', 'new']);
});

const snapshot = {
  walletBalances: { USDT: 10, THB: 20, MMK: 30, SGD: 40 },
  currency: 'SGD',
  lastProcessedMonth: '2026-09',
  monthlySalaries: [
    {
      id: 'salary',
      title: 'Salary',
      amount: 100,
      currency: 'SGD',
      category: 'Salary',
      isEnabled: true,
    },
  ],
  budgetEntries: [
    {
      id: 'expense',
      title: 'Lunch',
      amount: 3,
      currency: 'SGD',
      type: 'expense',
      category: 'Food',
      date: '2026-09-05',
    },
  ],
  familyTransactions: [
    {
      id: 'family',
      type: 'given',
      person: 'Family',
      amount: 1,
      currency: 'SGD',
      date: '2026-09-05',
    },
  ],
  loans: [
    {
      id: 'loan',
      type: 'lend',
      personName: 'Friend',
      amount: 5,
      currency: 'SGD',
      status: 'pending',
      repaidAmount: 0,
      date: '2026-09-05',
    },
  ],
  goldHoldings: [
    {
      id: 'gold',
      kyat: 1,
      pae: 0,
      yway: 0,
      buyPrice: 300,
      currency: 'SGD',
      purchaseDate: '2026-09-05',
      status: 'holding',
    },
  ],
};
test('complete backup round-trips every budget category and preference', () => {
  const backup = budgetBackupSchema.parse(JSON.parse(JSON.stringify(createBudgetBackup(snapshot))));
  const { version, exportedAt, ...data } = backup;
  assert.equal(version, '3.0');
  assert.ok(exportedAt);
  assert.deepEqual(data, snapshot);
});
test('legacy backups preserve omitted categories instead of defaulting them to empty', () => {
  const legacy = createBudgetBackup(snapshot);
  for (const key of ['loans', 'goldHoldings', 'currency', 'lastProcessedMonth']) delete legacy[key];
  const result = budgetBackupSchema.parse({ ...legacy, version: '2.0' });
  assert.equal(result.loans, undefined);
  assert.equal(result.currency, undefined);
});
test('rejects unsupported versions, missing categories, malformed records, and overflow', () => {
  const good = createBudgetBackup(snapshot);
  for (const invalid of [
    {},
    { ...good, version: '9.0' },
    { ...good, loans: undefined },
    { ...good, currency: 'FAKE' },
    { ...good, budgetEntries: [{ id: 'invalid' }] },
    { ...good, budgetEntries: [{ ...good.budgetEntries[0], amount: -1 }] },
    { ...good, budgetEntries: [{ ...good.budgetEntries[0], date: '2026-02-30' }] },
    { ...good, walletBalances: { ...good.walletBalances, USDT: Infinity } },
  ])
    assert.equal(budgetBackupSchema.safeParse(invalid).success, false);
});
test('rejects duplicate record IDs before any restore', () => {
  const good = createBudgetBackup(snapshot);
  assert.equal(
    budgetBackupSchema.safeParse({ ...good, loans: [good.loans[0], good.loans[0]] }).success,
    false,
  );
});

test('budget sync retries a failed batch before newer changes, preserving deletion order', async () => {
  const { createBudgetSyncScheduler } = await import('../src/features/budget/store/budget-sync.ts');
  const { useSettingsSync } = await import('../src/features/settings/sync-status.ts');
  const writes = [];
  let fail = true;
  const scheduler = createBudgetSyncScheduler(0, async (current) => {
    writes.push(current.currency);
    if (fail) throw new Error('Offline');
  });
  const pause = () => new Promise((resolve) => setTimeout(resolve, 10));
  scheduler.schedule({ ...snapshot, currency: 'THB' }, snapshot);
  await pause();
  assert.equal(useSettingsSync.getState().budget.status, 'error');
  scheduler.schedule({ ...snapshot, currency: 'MMK' }, { ...snapshot, currency: 'THB' });
  await pause();
  assert.deepEqual(writes, ['THB']);
  fail = false;
  useSettingsSync.getState().budget.retry();
  await pause();
  assert.deepEqual(writes, ['THB', 'THB', 'MMK']);
  assert.equal(scheduler.hasPending, false);
  assert.equal(useSettingsSync.getState().budget.status, 'saved');
});
