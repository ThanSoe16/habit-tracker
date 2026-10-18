import { test } from 'node:test';
import assert from 'node:assert/strict';
import { InfiniteQueryObserver } from '@tanstack/react-query';
import { createQueryClient } from '../src/lib/query-client.ts';
import { listPage, pageRange } from '../src/lib/supabase/pagination.ts';
import {
  routeSyncTargets,
  budgetGroupsForRoute,
  gymScopeForRoute,
} from '../src/features/sync/route-targets.ts';
import { replaceCachedHabit } from '../src/features/habits/services/habit-cache.ts';
import { filterHabits } from '../src/features/habits/utils/filter-habits.ts';
import { updateFundCache } from '../src/features/relationship-funds/services/update-fund-cache.ts';

const records = Array.from({ length: 23 }, (_, id) => ({ id: String(id) }));

test('lists fetch only the first ten, append on demand, and stop at the last page', async () => {
  const client = createQueryClient();
  const calls = [];
  const options = {
    queryKey: ['items', 'alice'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const [from, to] = pageRange(pageParam);
      calls.push([from, to]);
      return listPage(
        { data: records.slice(from, to + 1), count: records.length, error: null },
        pageParam,
      );
    },
    getNextPageParam: (page) => page.nextPage,
  };
  try {
    await client.fetchInfiniteQuery(options);
    assert.deepEqual(calls, [[0, 9]]);
    const observer = new InfiniteQueryObserver(client, options);
    await observer.fetchNextPage();
    assert.deepEqual(calls, [
      [0, 9],
      [10, 19],
    ]);
    assert.equal(observer.getCurrentResult().data.pages.flatMap((page) => page.rows).length, 20);
    await observer.fetchNextPage();
    assert.equal(observer.getCurrentResult().hasNextPage, false);
    await observer.fetchNextPage();
    assert.deepEqual(calls, [
      [0, 9],
      [10, 19],
      [20, 29],
    ]);
    assert.deepEqual(
      observer.getCurrentResult().data.pages.flatMap((page) => page.rows),
      records,
    );
    observer.destroy();
  } finally {
    client.clear();
  }
});

test('fresh revisits reuse data; expiry and invalidation fetch again; account keys stay separate', async () => {
  const client = createQueryClient();
  let calls = 0;
  const options = { queryKey: ['items', 'alice'], queryFn: async () => ++calls };
  try {
    await client.fetchQuery(options);
    await client.fetchQuery(options);
    assert.equal(calls, 1);
    assert.equal(client.getQueryData(['items', 'bob']), undefined);
    client.setQueryData(options.queryKey, 1, { updatedAt: Date.now() - 300_001 });
    await client.fetchQuery(options);
    assert.equal(calls, 2);
    await client.invalidateQueries({ queryKey: options.queryKey });
    await client.fetchQuery(options);
    assert.equal(calls, 3);
    client.clear();
    assert.equal(client.getQueryData(options.queryKey), undefined);
  } finally {
    client.clear();
  }
});

test('failed next page keeps loaded records available and can be retried', async () => {
  const client = createQueryClient();
  let fail = true;
  const options = {
    queryKey: ['items', 'alice'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (pageParam === 2 && fail) throw new Error('Offline');
      const [from, to] = pageRange(pageParam);
      return listPage(
        { data: records.slice(from, to + 1), count: records.length, error: null },
        pageParam,
      );
    },
    getNextPageParam: (page) => page.nextPage,
  };
  try {
    await client.fetchInfiniteQuery(options);
    const observer = new InfiniteQueryObserver(client, options);
    await observer.fetchNextPage();
    assert.equal(observer.getCurrentResult().isFetchNextPageError, true);
    assert.equal(observer.getCurrentResult().data.pages.length, 1);
    fail = false;
    await observer.fetchNextPage();
    assert.equal(observer.getCurrentResult().data.pages.length, 2);
    observer.destroy();
  } finally {
    client.clear();
  }
});

test('invalid pages and truncated responses are rejected, while empty final pages are valid', () => {
  for (const page of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => pageRange(page));
  assert.throws(
    () => listPage({ data: records.slice(0, 5), count: 23, error: null }, 1),
    /incomplete/,
  );
  assert.throws(() => listPage({ data: [], count: null, error: null }, 1), /incomplete/);
  assert.throws(() => listPage({ data: null, count: 0, error: { code: 'offline' } }, 1));
  assert.deepEqual(listPage({ data: [], count: 0, error: null }, 1), {
    rows: [],
    total: 0,
    nextPage: undefined,
  });
});

test('routes select only their legacy dependencies and defer complete budget reports', () => {
  assert.deepEqual(routeSyncTargets('/habits/today'), ['user']);
  assert.deepEqual(routeSyncTargets('/store/gallery'), ['user']);
  assert.deepEqual(routeSyncTargets('/mood/history'), ['user']);
  assert.deepEqual(routeSyncTargets('/budget/expenses'), ['user', 'budget']);
  assert.deepEqual(budgetGroupsForRoute('/budget/expenses'), ['wallets', 'settings']);
  assert.equal(budgetGroupsForRoute('/budget-generals/reports'), undefined);
  assert.deepEqual(routeSyncTargets('/workout/history'), ['user', 'gym']);
  assert.equal(gymScopeForRoute('/workout/history'), 'history');
  assert.equal(gymScopeForRoute('/workout/today'), 'session');
});

const habit = (id, history = {}) => ({
  id,
  name: id,
  frequency: 'daily',
  repeatDays: [0, 1, 2, 3, 4, 5, 6],
  color: 'blue',
  history,
  streak: 0,
  createdAt: '2026-10-01',
});
test('today filters the entire summary before selecting ten detailed records', () => {
  const habits = Array.from({ length: 23 }, (_, i) =>
    habit(String(i).padStart(2, '0'), { '2026-10-18': i < 12 }),
  );
  const filtered = filterHabits(habits, {
    date: '2026-10-18',
    status: 'pending',
    hideCompleted: false,
    sortBy: 'alphabetical',
  });
  assert.equal(filtered.length, 11);
  assert.equal(filtered[0].id, '12');
  assert.equal(filtered.slice(0, 10).at(-1).id, '21');
});

test('habit updates reach existing pages without replacing other identities or discarding history', () => {
  const client = createQueryClient();
  const key = ['habits', 'alice', 'infinite', 'all'];
  const initial = habit('one');
  try {
    const data = { pages: [{ rows: [initial], total: 1 }], pageParams: [1] };
    client.setQueryData(key, data);
    client.setQueryData(['habits', 'bob', 'infinite', 'all'], data);
    const saved = habit('one', { '2026-10-01': true, '2026-10-18': true });
    replaceCachedHabit(client, 'alice', saved, saved.id);
    assert.deepEqual(client.getQueryData(key).pages[0].rows[0].history, saved.history);
    assert.deepEqual(
      client.getQueryData(['habits', 'bob', 'infinite', 'all']).pages[0].rows[0].history,
      {},
    );
    replaceCachedHabit(client, 'alice', null, saved.id);
    assert.deepEqual(client.getQueryData(key).pages[0].rows, []);
  } finally {
    client.clear();
  }
});

test('confirmed fund writes update infinite pages before a refresh is available', async () => {
  const client = createQueryClient();
  const key = ['relationship-funds', 'alice', 'infinite', 'ALL', 1];
  const row = { id: 'fund-one', date: '2026-10-18', person: 'TSO', amount: 10 };
  try {
    client.setQueryData(key, { pages: [{ rows: [row], total: 1 }], pageParams: [1] });
    await updateFundCache(client, 'alice', { ...row, amount: 20 });
    assert.equal(client.getQueryData(key).pages[0].rows[0].amount, 20);
    await updateFundCache(client, 'alice', row, true);
    assert.deepEqual(client.getQueryData(key).pages[0].rows, []);
  } finally {
    client.clear();
  }
});

test('combined activity skips exhausted sources while the longer list continues', async () => {
  const { readActivityPage } =
    await import('../src/features/budget/services/activity-pagination.ts');
  const totals = { income: 23, expenses: 15, exchange: 7 };
  const calls = [];
  const read = async (group, page) => {
    const from = (page - 1) * 10;
    assert.ok(from < totals[group], 'must not send an out-of-range request');
    calls.push([group, page]);
    return {
      ids: Array.from(
        { length: Math.min(10, totals[group] - from) },
        (_, i) => `${group}-${from + i}`,
      ),
      total: totals[group],
    };
  };
  let page = await readActivityPage({ page: 1 }, read);
  const ids = [...page.ids];
  while (page.nextPage) {
    page = await readActivityPage(page.nextPage, read);
    ids.push(...page.ids);
  }
  assert.equal(ids.length, 45);
  assert.deepEqual(calls, [
    ['income', 1],
    ['expenses', 1],
    ['exchange', 1],
    ['income', 2],
    ['expenses', 2],
    ['income', 3],
  ]);
});
