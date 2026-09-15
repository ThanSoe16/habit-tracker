import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';
import { updateSavingsCache } from '../src/features/savings/services/update-savings-cache.ts';
import {
  savingsGoalInputSchema,
  savingsTransactionInputSchema,
  isSavingsUnlocked,
  getSavingsBalance,
} from '../src/features/savings/types/index.ts';
import { savingsKeys } from '../src/features/savings/services/query-keys.ts';
import { createSavingsService } from '../src/features/savings/services/savings-service.ts';
import { getCurrentBalance } from '../src/features/budget/utils/current-balance.ts';

const userId = '11111111-1111-4111-8111-111111111111';
const id = '22222222-2222-4222-8222-222222222222';
const goal = {
  id,
  user_id: userId,
  name: 'Mom',
  currency: 'MMK',
  balance: 100,
  target_amount: 100,
  unlock_date: null,
  unlock_rule: 'either',
  note: '',
  target_reached_at: null,
  created_at: '2026-09-15T00:00:00+00:00',
};
const input = {
  name: 'Mom',
  currency: 'MMK',
  target_amount: 100,
  unlock_date: null,
  unlock_rule: 'either',
  note: '',
};

test('Home adds relationship funds to the displayed MMK total and waits for complete balances', () => {
  assert.equal(getCurrentBalance(11764523, 110000, 250000, 'MMK'), 12124523);
  assert.equal(getCurrentBalance(11764523, 110000, 0, 'MMK'), 11874523);
  assert.equal(getCurrentBalance(11764523, 110000, -50000, 'MMK'), 11824523);
  assert.equal(getCurrentBalance(11764523, 110000, null, 'MMK'), null);
  assert.equal(getCurrentBalance(11764523, null, 250000, 'MMK'), null);
  // Do not add an MMK amount to a wallet in a different currency.
  for (const currency of ['USDT', 'THB', 'SGD']) {
    assert.equal(getCurrentBalance(100, 20, 250000, currency), 120);
    assert.equal(getCurrentBalance(100, 20, null, currency), 120);
  }
});

test('Home current balance includes existing savings and deposits without counting transfers twice', () => {
  const rows = [
    { id, currency: 'MMK', balance: 50000 },
    { id: userId, currency: 'MMK', balance: 60000 },
    { id: 'thb', currency: 'THB', balance: 500 },
  ];
  const available = 11214523;
  assert.equal(available + getSavingsBalance(rows, 'MMK'), 11324523);
  rows[1].balance += 10000;
  const afterDeposit = available + getSavingsBalance(rows, 'MMK');
  assert.equal(afterDeposit, 11334523);
  rows[1].balance -= 20000;
  assert.equal(available + 20000 + getSavingsBalance(rows, 'MMK'), afterDeposit);
  assert.equal(available + getSavingsBalance(rows, 'MMK'), afterDeposit - 20000);
  assert.equal(getSavingsBalance(rows, 'THB'), 500);
  assert.equal(getSavingsBalance(rows, 'SGD'), 0);
});

test('Home savings totals read every page, keep account scope and reject incomplete results', async () => {
  const rows = Array.from({ length: 503 }, (_, index) => ({
    ...goal,
    id: `aaaaaaaa-aaaa-4aaa-8aaa-${String(index).padStart(12, '0')}`,
    balance: 10,
  }));
  const calls = [];
  let fail = false;
  const builder = {
    select(columns) {
      calls.push(['select', columns]);
      return builder;
    },
    eq(key, value) {
      calls.push(['eq', key, value]);
      return builder;
    },
    order(key) {
      calls.push(['order', key]);
      return builder;
    },
    range(from, to) {
      calls.push(['range', from, to]);
      return Promise.resolve({
        data: fail ? [] : rows.slice(from, Math.min(from + 100, to + 1)),
        count: rows.length,
        error: null,
      });
    },
  };
  const service = createSavingsService(async () => ({ userId, supabase: { from: () => builder } }));
  const result = await service.balances(userId);
  assert.equal(getSavingsBalance(result, 'MMK'), 5030);
  assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'user_id' && call[2] === userId));
  assert.ok(calls.some((call) => call[0] === 'range' && call[1] === 500));
  fail = true;
  await assert.rejects(service.balances(userId), /incomplete/);
});

test('a saved deposit updates the main savings amount and progress without a successful refresh', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const otherGoal = { ...goal, id: userId, name: 'Another saving' };
  const ownKey = savingsKeys.list(userId, 1);
  const otherAccountKey = savingsKeys.list(id, 1);
  client.setQueryData(ownKey, { rows: [goal, otherGoal], total: 2 });
  client.setQueryData(otherAccountKey, { rows: [{ ...goal, user_id: id }], total: 1 });
  client.setQueryData(savingsKeys.balances(userId), [
    { id, currency: goal.currency, balance: 100 },
  ]);
  client.setQueryData(savingsKeys.balances(id), [{ id, currency: goal.currency, balance: 80 }]);
  const saved = { ...goal, balance: 150, target_reached_at: '2026-09-15T01:00:00Z' };
  await updateSavingsCache(client, userId, saved);
  await updateSavingsCache(client, userId, saved); // Retrying the same saved row must not add twice.
  assert.equal(getSavingsBalance(client.getQueryData(savingsKeys.balances(userId)), 'MMK'), 150);
  assert.equal(getSavingsBalance(client.getQueryData(savingsKeys.balances(id)), 'MMK'), 80);
  assert.deepEqual(client.getQueryData(ownKey), { rows: [saved, otherGoal], total: 2 });
  assert.equal(isSavingsUnlocked(client.getQueryData(ownKey).rows[0]), true);
  assert.equal(client.getQueryData(otherAccountKey).rows[0].balance, 100);
  assert.equal(client.getQueryData(savingsKeys.list(userId, 2)), undefined);
  await assert.rejects(
    client.fetchQuery({
      queryKey: ownKey,
      queryFn: async () => {
        throw new Error('offline');
      },
    }),
  );
  assert.equal(client.getQueryData(ownKey).rows[0].balance, 150);
  client.clear();
});

test('an older in-flight savings read cannot overwrite the saved deposit', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const key = savingsKeys.list(userId, 1);
  client.setQueryData(key, { rows: [goal], total: 1 });
  let finish;
  const pending = client
    .fetchQuery({
      queryKey: key,
      queryFn: () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    })
    .catch(() => undefined);
  await updateSavingsCache(client, userId, { ...goal, balance: 200 });
  finish({ rows: [goal], total: 1 });
  await pending;
  assert.equal(client.getQueryData(key).rows[0].balance, 200);
  client.clear();
});

test('requires a withdrawal restriction and validates money and real dates', () => {
  assert.equal(savingsGoalInputSchema.safeParse(input).success, true);
  for (const patch of [
    { target_amount: null },
    { target_amount: 0 },
    { target_amount: 1.001 },
    { target_amount: Infinity },
    { unlock_date: '2026-02-30' },
    { name: ' ' },
  ]) {
    assert.equal(savingsGoalInputSchema.safeParse({ ...input, ...patch }).success, false);
  }
  assert.equal(
    savingsTransactionInputSchema.safeParse({
      goal_id: id,
      kind: 'deposit',
      amount: 1,
      person: '',
      note: '',
      to_budget: true,
    }).success,
    false,
  );
});
test('UTC boundaries, combined rules and partial withdrawal stay consistent', () => {
  const before = new Date('2026-09-14T23:59:59Z');
  const atDate = new Date('2026-09-15T00:00:00Z');
  assert.equal(isSavingsUnlocked(goal, atDate), false);
  const reached = { ...goal, balance: 20, target_reached_at: '2026-09-14T00:00:00Z' };
  assert.equal(isSavingsUnlocked(reached, atDate), true);
  const both = { ...reached, unlock_date: '2026-09-15', unlock_rule: 'both' };
  assert.equal(isSavingsUnlocked(both, before), false);
  assert.equal(isSavingsUnlocked(both, atDate), true);
  assert.equal(isSavingsUnlocked({ ...both, target_reached_at: null }, atDate), false);
  assert.equal(
    isSavingsUnlocked({ ...both, target_reached_at: null, unlock_rule: 'either' }, atDate),
    true,
  );
  assert.equal(
    isSavingsUnlocked({ ...both, target_amount: null, target_reached_at: null }, atDate),
    true,
  );
});
test('cache keys separate identity, page and goal', () => {
  assert.notDeepEqual(savingsKeys.list(userId, 1), savingsKeys.list(id, 1));
  assert.notDeepEqual(savingsKeys.list(userId, 1), savingsKeys.list(userId, 2));
  assert.notDeepEqual(savingsKeys.history(userId, id, 1), savingsKeys.history(userId, userId, 1));
});
test('invalid inputs are rejected before any service request', async () => {
  let requests = 0;
  const service = createSavingsService(async () => {
    requests++;
    throw new Error('unexpected');
  });
  await assert.rejects(service.create(userId, id, { ...input, target_amount: 0 }));
  await assert.rejects(service.list(userId, 0));
  await assert.rejects(service.history(userId, 'bad', 1));
  assert.equal(requests, 0);
});
test('writes map editable fields only, return persisted rows and sanitize failures', async () => {
  let sent;
  let response = { data: goal, error: null };
  const service = createSavingsService(async () => ({
    userId,
    supabase: {
      rpc: (name, args) => {
        sent = { name, args };
        return { single: async () => response };
      },
    },
  }));
  assert.deepEqual(await service.create(userId, id, { ...input, user_id: id, balance: 999 }), goal);
  assert.equal(sent.args.p_id, id);
  assert.equal('user_id' in sent.args, false);
  assert.equal('balance' in sent.args, false);
  response = { data: null, error: { code: '42501', message: 'private backend message' } };
  await assert.rejects(
    service.create(userId, id, input),
    (error) => error.code === '42501' && !error.message.includes('private'),
  );
  response = { data: {}, error: null };
  await assert.rejects(service.create(userId, id, input), /incomplete/);
  await assert.rejects(service.create(id, id, input), /session changed/);
});
test('list orders deterministically, bounds pages, and rejects failed/incomplete reads', async () => {
  const calls = [];
  let response = { data: [goal], count: 1, error: null };
  const builder = {
    then(resolve) {
      return Promise.resolve(response).then(resolve);
    },
  };
  for (const method of ['select', 'eq', 'order', 'range'])
    builder[method] = (...args) => {
      calls.push([method, ...args]);
      return builder;
    };
  const service = createSavingsService(async () => ({ userId, supabase: { from: () => builder } }));
  assert.deepEqual(await service.list(userId, 1), { rows: [goal], total: 1 });
  assert.ok(calls.some((call) => call[0] === 'order' && call[1] === 'id'));
  assert.ok(calls.some((call) => call[0] === 'range' && call[1] === 0 && call[2] === 9));
  for (const result of [
    { data: null, count: null, error: { code: '500' } },
    { data: [], count: 1, error: null },
    { data: [], count: null, error: null },
  ]) {
    response = result;
    await assert.rejects(service.list(userId, 1));
  }
});

test('RPC requests require a single persisted row through the actual Supabase client', async () => {
  const requests = [];
  const supabase = createClient('https://savings.example.test', 'test-key', {
    accessToken: async () => 'test-token',
    global: {
      fetch: async (url, options) => {
        requests.push({
          url: String(url),
          accept: new Headers(options.headers).get('Accept'),
          body: JSON.parse(options.body),
        });
        return new Response(JSON.stringify(goal), {
          status: 200,
          headers: { 'Content-Type': 'application/vnd.pgrst.object+json' },
        });
      },
    },
  });
  const service = createSavingsService(async () => ({ userId, supabase }));
  await service.create(userId, id, input);
  await service.transact(userId, id, {
    goal_id: id,
    kind: 'withdrawal',
    amount: 10,
    person: '',
    note: '',
    to_budget: true,
  });
  assert.equal(requests.length, 2);
  for (const request of requests) assert.equal(request.accept, 'application/vnd.pgrst.object+json');
  assert.ok(requests[1].url.endsWith('/rpc/record_savings_transaction'));
  assert.equal(requests[1].body.p_to_budget, true);
});

test('budget transfer refresh preserves failed or stale snapshots and rejects an account switch', async (t) => {
  const { useBudgetStore, refreshBudgetAfterSavings, assertBudgetReadyForSavings } =
    await import('../src/store/use-budget-store.ts');
  const { budgetService } = await import('../src/features/budget/services/supabase.ts');
  const { setIdentityScope, partitionIdentityStores } =
    await import('../src/lib/supabase/identity-scope.ts');
  setIdentityScope(userId);
  partitionIdentityStores(() =>
    useBudgetStore.setState({
      walletBalances: { USDT: 0, MMK: 50, THB: 0, SGD: 0 },
      budgetEntries: [],
    }),
  );
  t.mock.method(budgetService, 'fetchBudgetData', async () => null);
  assert.equal(await refreshBudgetAfterSavings(), false);
  assert.equal(useBudgetStore.getState().walletBalances.MMK, 50);
  budgetService.fetchBudgetData.mock.mockImplementation(async () => ({
    walletBalances: { USDT: 0, MMK: 70, THB: 0, SGD: 0 },
    budgetEntries: [],
  }));
  assert.equal(await refreshBudgetAfterSavings(), true);
  assert.equal(useBudgetStore.getState().walletBalances.MMK, 70);
  assert.doesNotThrow(assertBudgetReadyForSavings); // Applying remote data must not queue another write.
  useBudgetStore.getState().updateWalletBalance('MMK', 71);
  assert.throws(assertBudgetReadyForSavings, /still saving/);
  assert.equal(await refreshBudgetAfterSavings(), false);
  assert.equal(useBudgetStore.getState().walletBalances.MMK, 71);
  setIdentityScope(id); // Clear queued synthetic writes before their timer runs.
  budgetService.fetchBudgetData.mock.mockImplementation(async () => {
    setIdentityScope(userId);
    return { walletBalances: { MMK: 999 }, budgetEntries: [] };
  });
  await assert.rejects(refreshBudgetAfterSavings(), /session changed/);
  assert.equal(useBudgetStore.getState().walletBalances.MMK, 71);
});
