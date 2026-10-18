import { test, beforeEach } from 'node:test';
import { accountService } from '../src/lib/supabase/account-client.ts';
import assert from 'node:assert/strict';
import { supabase } from '../src/lib/supabase/client.ts';
import { budgetReadService } from '../src/features/budget/services/budget-read-service.ts';
import budgetApiService from '../src/features/budget/services/api.ts';
import habitsApiService from '../src/features/habits/services/api.ts';
import { habitsService } from '../src/features/habits/services/supabase.ts';

// Mock the network boundary; these tests make no database requests or RLS claims.
function mockRequests(t, respond) {
  const calls = [];
  t.mock.method(supabase, 'from', (table) => {
    const call = { table, operation: 'read' };
    calls.push(call);
    const query = {
      match() {
        return query;
      },
      gte() {
        return query;
      },
      lte() {
        return query;
      },
      in() {
        return query;
      },
      or() {
        return query;
      },
      not() {
        return query;
      },
      abortSignal() {
        return query;
      },
      order() {
        return query;
      },
      range(from, to) {
        call.range = [from, to];
        return query;
      },
      insert(payload) {
        call.operation = 'insert';
        call.payload = payload;
        return query;
      },
      upsert(payload) {
        call.operation = 'upsert';
        call.payload = payload;
        return query;
      },
      update(payload) {
        call.operation = 'update';
        call.payload = payload;
        return query;
      },
      select(columns) {
        call.columns = columns;
        return query;
      },
      delete() {
        call.operation = 'delete';
        return query;
      },
      eq(column, value) {
        call.filter = [column, value];
        return query;
      },
      single() {
        call.single = true;
        return query;
      },
      maybeSingle() {
        return query;
      },
      then(resolve, reject) {
        return Promise.resolve()
          .then(() => respond(call))
          .then(resolve, reject);
      },
    };
    return query;
  });
  return calls;
}

const emptyResult = ({ table }) => ({
  data: table === 'budget_settings' ? null : [],
  error: null,
  count: 0,
});

test('a valid empty budget remains a successful snapshot', async (t) => {
  mockRequests(t, emptyResult);
  const data = await budgetReadService.fetchBudgetData();
  assert.deepEqual(data.budgetEntries, []);
  assert.deepEqual(data.walletBalances, { USDT: 0, THB: 0, MMK: 0, SGD: 0 });
});

test('failure of any budget table rejects the snapshot instead of clearing data', async (t) => {
  let failedTable;
  mockRequests(t, (call) =>
    call.table === failedTable
      ? { data: null, error: { message: 'private backend detail' } }
      : emptyResult(call),
  );
  for (failedTable of [
    'current_budget',
    'family_budgets',
    'incomes',
    'expenses',
    'currency_exchanges',
    'monthly_salary',
    'budget_settings',
    'loans',
    'gold_holdings',
  ]) {
    assert.equal(await budgetReadService.fetchBudgetData(), null, failedTable);
    await assert.rejects(budgetApiService.getBudgetData(), /Could not load your budget/);
  }
});

test('an incomplete list without a reported error is not an empty success', async (t) => {
  mockRequests(t, (call) =>
    call.table === 'expenses' ? { data: null, error: null } : emptyResult(call),
  );
  assert.equal(await budgetReadService.fetchBudgetData(), null);
});

test('failed budget refresh preserves the store snapshot', async (t) => {
  mockRequests(t, () => ({ data: null, error: { message: 'Offline' } }));
  const { useBudgetStore } = await import('../src/store/use-budget-store.ts');
  const before = useBudgetStore.getState();
  await assert.rejects(before.fetchFromSupabase(), /Could not load the budget/);
  assert.equal(useBudgetStore.getState(), before);
});

test('budget and habit APIs reject zero-row deletes and sanitize failures', async (t) => {
  let result = { data: null, error: null };
  const calls = mockRequests(t, () => result);
  const operations = [
    ['monthly_salary', () => budgetApiService.deleteMonthlySalary('legacy-id')],
    ['expenses', () => budgetApiService.deleteBudgetEntry({ id: 'legacy-id', type: 'expense' })],
    ['incomes', () => budgetApiService.deleteBudgetEntry({ id: 'legacy-id', type: 'income' })],
    [
      'currency_exchanges',
      () => budgetApiService.deleteBudgetEntry({ id: 'legacy-id', type: 'exchange' }),
    ],
    ['habits', () => habitsApiService.deleteHabit('legacy-id')],
  ];
  for (const [table, remove] of operations) {
    for (const error of [null, { message: 'private backend detail' }]) {
      result = { data: null, error };
      await assert.rejects(remove(), (failure) => {
        assert.match(failure.message, /Could not delete/);
        assert.doesNotMatch(failure.message, /private backend detail/);
        return true;
      });
    }
    result = { data: { id: 'legacy-id' }, error: null };
    assert.equal(await remove(), true);
    assert.deepEqual(calls.at(-1), {
      table,
      operation: 'delete',
      columns: 'id',
      filter: ['id', 'legacy-id'],
      single: true,
    });
  }
});

test('empty record IDs are rejected before issuing requests', async (t) => {
  const calls = mockRequests(t, emptyResult);
  t.mock.method(habitsService, 'fetchHabits', () => assert.fail('Unexpected read'));
  await assert.rejects(budgetApiService.deleteMonthlySalary(''));
  await assert.rejects(budgetApiService.deleteBudgetEntry({ id: '', type: 'expense' }));
  await assert.rejects(habitsApiService.deleteHabit(''));
  await assert.rejects(habitsApiService.getHabitById(''));
  assert.equal(calls.length, 0);
});

test('habit read errors differ from a missing record or empty list', async (t) => {
  let result = null;
  t.mock.method(habitsService, 'fetchHabits', async () => result);
  t.mock.method(habitsService, 'detail', async () => {
    if (result === null) throw new Error('Could not load the habit');
    return null;
  });
  await assert.rejects(habitsApiService.getHabits(), /Could not load your habits/);
  await assert.rejects(habitsApiService.getHabitById('missing'), /Could not load the habit/);
  result = [];
  assert.deepEqual(await habitsApiService.getHabits(), []);
  assert.equal(await habitsApiService.getHabitById('missing'), null);
});

test('failed habit saves cannot report success', async (t) => {
  t.mock.method(habitsService, 'saveHabit', async () => {
    throw new Error('Could not save the habit.');
  });
  await assert.rejects(
    habitsApiService.saveHabit({
      id: 'habit-id',
      name: 'Read',
      color: 'primary',
      frequency: 'daily',
      repeatDays: [],
      history: {},
      streak: 0,
      createdAt: '2026-09-07T00:00:00Z',
    }),
    /Could not save the habit/,
  );
});

test('habit kind filtering includes legacy build habits and excludes other kinds', async (t) => {
  t.mock.method(habitsService, 'fetchHabits', async () => [
    { id: 'legacy' },
    { id: 'build', habitKind: 'build' },
    { id: 'quit', habitKind: 'quit' },
  ]);
  assert.deepEqual(
    (await habitsApiService.getHabits({ habitKind: 'build' })).map((h) => h.id),
    ['legacy', 'build'],
  );
  assert.deepEqual(
    (await habitsApiService.getHabits({ habitKind: 'quit' })).map((h) => h.id),
    ['quit'],
  );
});

test('complete reads follow server caps and reject incomplete or changing counts', async () => {
  const { readCompleteList } = await import('../src/lib/supabase/request.ts');
  const all = Array.from({ length: 7 }, (_, id) => ({ id }));
  const offsets = [];
  const result = await readCompleteList({
    range: async (from, to) => {
      offsets.push([from, to]);
      return { data: all.slice(from, from + 2), count: all.length, error: null };
    },
  });
  assert.deepEqual(result.data, all);
  assert.deepEqual(
    offsets.map(([from]) => from),
    [0, 2, 4, 6],
  );
  await assert.rejects(
    readCompleteList({ range: async () => ({ data: [], count: 1, error: null }) }),
  );
  await assert.rejects(
    readCompleteList({ range: async () => ({ data: [], count: null, error: null }) }),
  );
  await assert.rejects(
    readCompleteList({
      range: async (from) => ({ data: [{ id: from }], count: from ? 3 : 2, error: null }),
    }),
  );
});

test('habit writes return persisted values and retain monthly dates', async (t) => {
  const row = {
    id: 'habit-id',
    name: 'Persisted name',
    color: 'primary',
    frequency: 'monthly',
    repeat_days: [31],
  };
  const calls = mockRequests(t, () => ({ data: row, error: null }));
  const saved = await habitsApiService.saveHabit({
    id: 'habit-id',
    name: 'Submitted name',
    color: 'primary',
    frequency: 'monthly',
    repeatDays: [31],
    history: {},
    streak: 0,
    createdAt: '2026-09-08T00:00:00Z',
  });
  assert.equal(saved.name, 'Persisted name');
  assert.deepEqual(saved.repeatDays, [31]);
  assert.equal(calls[0].payload.name, 'Submitted name');
  assert.ok(!calls[0].columns.includes('*'));
});

test('habit optimistic CRUD rolls back rejected saves and retains failed deletions', async (t) => {
  const { useHabitStore } = await import('../src/store/use-habit-store.ts');
  const original = useHabitStore.getState();
  t.after(() => useHabitStore.setState(original, true));
  const habit = {
    id: 'existing',
    name: 'Read',
    color: 'primary',
    frequency: 'daily',
    repeatDays: [],
    history: {},
    streak: 0,
    createdAt: '2026-09-08T00:00:00Z',
  };
  useHabitStore.setState({ habits: [habit] });
  t.mock.method(habitsApiService, 'saveHabit', async () => {
    throw new Error('Offline');
  });
  t.mock.method(habitsApiService, 'deleteHabit', async () => {
    throw new Error('Offline');
  });
  await assert.rejects(useHabitStore.getState().updateHabit('existing', { name: 'Changed' }));
  assert.deepEqual(useHabitStore.getState().habits, [habit]);
  await assert.rejects(useHabitStore.getState().removeHabit('existing'));
  assert.deepEqual(useHabitStore.getState().habits, [habit]);
  await assert.rejects(useHabitStore.getState().addHabit('New', 'primary', 'daily', []));
  assert.deepEqual(useHabitStore.getState().habits, [habit]);
});

test('habit completion saves remarks and elapsed progress in Supabase history before updating the card', async (t) => {
  const { useHabitStore } = await import('../src/store/use-habit-store.ts');
  const original = useHabitStore.getState();
  t.after(() => useHabitStore.setState(original, true));
  const date = '2026-10-10';
  const habit = {
    id: 'completion-habit',
    name: 'Meditation',
    color: 'primary',
    frequency: 'daily',
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    unitType: 'duration',
    timerMode: 'down',
    goalValue: 5,
    history: {
      [date]: { completed: false, timeTaken: '02:00', notes: 'Draft' },
      '2026-10-09': { completed: true, notes: 'Yesterday' },
    },
    streak: 0,
    createdAt: '2026-10-01T00:00:00Z',
  };
  useHabitStore.setState({ habits: [habit] });
  let finish;
  const pending = new Promise((resolve) => {
    finish = resolve;
  });
  const calls = mockRequests(t, async (call) => {
    await pending;
    return { data: call.payload, error: null };
  });
  const save = useHabitStore
    .getState()
    .completeHabit(habit.id, date, '  Felt focused\nKept going  ');
  assert.equal(useHabitStore.getState().habits[0], habit);
  finish();
  await save;
  assert.equal(calls.length, 1);
  assert.equal(calls[0].table, 'habits');
  assert.equal(calls[0].operation, 'upsert');
  assert.deepEqual(calls[0].payload.history[date], {
    completed: true,
    timeTaken: '02:00',
    notes: 'Felt focused\nKept going',
  });
  assert.deepEqual(useHabitStore.getState().habits[0].history, calls[0].payload.history);
  assert.deepEqual(calls[0].payload.history['2026-10-09'], habit.history['2026-10-09']);
});

test('failed completion preserves history and can retry the same remarks', async (t) => {
  const { useHabitStore } = await import('../src/store/use-habit-store.ts');
  const original = useHabitStore.getState();
  t.after(() => useHabitStore.setState(original, true));
  const habit = {
    id: 'completion-habit',
    name: 'Read',
    color: 'primary',
    frequency: 'daily',
    repeatDays: [],
    unitType: 'count',
    goalValue: 1,
    history: {},
    streak: 0,
    createdAt: '2026-10-10T00:00:00Z',
  };
  useHabitStore.setState({ habits: [habit] });
  let fails = true;
  mockRequests(t, (call) =>
    fails
      ? { data: null, error: { message: 'Internal failure' } }
      : { data: call.payload, error: null },
  );
  await assert.rejects(
    useHabitStore.getState().completeHabit(habit.id, '2026-10-10', 'Read chapter 1'),
  );
  assert.equal(useHabitStore.getState().habits[0], habit);
  fails = false;
  await useHabitStore.getState().completeHabit(habit.id, '2026-10-10', 'Read chapter 1');
  assert.deepEqual(useHabitStore.getState().habits[0].history['2026-10-10'], {
    completed: true,
    count: '1',
    notes: 'Read chapter 1',
  });
});

test('completion supports simple habits, counts, and timed goals without replacing recorded progress', async () => {
  const { createHabitCompletion } = await import('../src/features/habits/utils/completion.ts');
  const habit = { history: {} };
  assert.deepEqual(createHabitCompletion(habit, '2026-10-10', ''), { completed: true, notes: '' });
  assert.equal(
    createHabitCompletion(
      { ...habit, unitType: 'time', timeUnit: 'hr', goalValue: 1 },
      '2026-10-10',
      'Done',
    ).timeTaken,
    '01:00:00',
  );
  assert.equal(
    createHabitCompletion(
      { ...habit, unitType: 'duration', timeUnit: 'sec', goalValue: 30 },
      '2026-10-10',
      'Done',
    ).timeTaken,
    '00:30',
  );
  assert.equal(
    createHabitCompletion(
      {
        unitType: 'count',
        goalValue: 2,
        history: { '2026-10-10': { completed: false, count: '3' } },
      },
      '2026-10-10',
      'Done',
    ).count,
    '3',
  );
});

test('mood and workout read failures cannot become successful empty snapshots', async (t) => {
  const { moodService } = await import('../src/features/mood/services/supabase.ts');
  const { gymService } = await import('../src/features/gym/services/supabase.ts');
  const { gymBodyMetricsService } = await import('../src/features/gym/services/body-metrics.ts');
  mockRequests(t, () => ({
    data: null,
    error: { code: 'OFFLINE', message: 'private backend detail' },
    count: null,
  }));
  for (const read of [
    moodService.fetchMoods,
    gymService.fetchGymPlans,
    gymService.fetchCustomExercises,
    gymService.fetchWorkoutLogs,
    gymBodyMetricsService.fetchLogs,
  ]) {
    await assert.rejects(read(), (error) => {
      assert.doesNotMatch(error.message, /private backend detail/);
      assert.equal(error.code, 'OFFLINE');
      return true;
    });
  }
});

test('failed media CRUD keeps the local library and never fabricates saved rows', async (t) => {
  const { useMediaStore } = await import('../src/store/use-media-store.ts');
  const original = useMediaStore.getState();
  t.after(() => useMediaStore.setState(original, true));
  const entry = {
    id: 'file-id',
    type: 'voice',
    title: 'Memo',
    dataUrl: 'https://example.com/memo.webm',
    fileSize: 20,
    mimeType: 'audio/webm',
    createdAt: '2026-09-08T00:00:00Z',
  };
  useMediaStore.setState({ mediaEntries: [entry] });
  mockRequests(t, () => ({ data: null, error: null }));
  await assert.rejects(useMediaStore.getState().addMediaEntry({ ...entry, id: 'new' }));
  await assert.rejects(useMediaStore.getState().updateMediaEntry(entry.id, { title: 'Changed' }));
  await assert.rejects(useMediaStore.getState().deleteMediaEntry(entry.id));
  assert.deepEqual(useMediaStore.getState().mediaEntries, [entry]);
});

test('identity partitions preserve stored drafts and never hydrate unassigned legacy data', async () => {
  const { createStore } = await import('zustand/vanilla');
  const { persist, createJSONStorage } = await import('zustand/middleware');
  const { partitionStore } = await import('../src/lib/supabase/partition-store.ts');
  const memory = new Map([
    ['legacy', JSON.stringify({ state: { records: ['unassigned'] }, version: 0 })],
  ]);
  const storage = createJSONStorage(() => ({
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  }));
  const store = createStore(
    persist(() => ({ records: [] }), { name: 'legacy', storage, skipHydration: true }),
  );
  await partitionStore(store, 'user:a', true);
  assert.deepEqual(store.getState().records, []);
  store.setState({ records: ['a draft'] });
  await partitionStore(store, 'user:b', true);
  assert.deepEqual(store.getState().records, []);
  store.setState({ records: ['b draft'] });
  await partitionStore(store, 'signed-out', false);
  assert.deepEqual(store.getState().records, []);
  await partitionStore(store, 'user:a', true);
  assert.deepEqual(store.getState().records, ['a draft']);
  await partitionStore(store, 'user:b', true);
  assert.deepEqual(store.getState().records, ['b draft']);
  assert.deepEqual(JSON.parse(memory.get('legacy')).state.records, ['unassigned']);
});

test('query keys isolate identity, record IDs, and filters', async () => {
  const { habitKeys } = await import('../src/features/habits/services/query-keys.ts');
  const { budgetKeys } = await import('../src/features/budget/services/query-keys.ts');
  assert.notDeepEqual(habitKeys.list('a'), habitKeys.list('b'));
  assert.notDeepEqual(habitKeys.detail('a', 'one'), habitKeys.detail('a', 'two'));
  assert.notDeepEqual(
    habitKeys.list('a', { habitKind: 'build' }),
    habitKeys.list('a', { habitKind: 'quit' }),
  );
  assert.notDeepEqual(
    budgetKeys.list('a', { currency: 'THB' }),
    budgetKeys.list('a', { currency: 'MMK' }),
  );
});

test('wellbeing writes strip protected fields and reject invalid limits before table requests', async (t) => {
  const { digitalWellbeingService } =
    await import('../src/features/wellbeing/services/supabase.ts');
  t.mock.method(supabase.auth, 'getSession', async () => ({
    data: { session: { user: { id: 'current-user' } } },
    error: null,
  }));
  const calls = mockRequests(t, () => ({ data: { id: 'saved' }, error: null }));
  await digitalWellbeingService.upsertAppLimit({
    app_identifier: 'social',
    app_name: 'Social',
    daily_limit_seconds: 600,
    warning_before_seconds: 60,
    is_enabled: true,
    user_id: 'other-user',
    id: 'protected',
  });
  assert.equal(calls[0].payload.user_id, 'current-user');
  assert.equal(calls[0].payload.id, undefined);
  await digitalWellbeingService.upsertSettings({
    daily_pickup_goal: 10,
    user_id: 'other-user',
    created_at: 'forged',
    unrecognized: true,
  });
  assert.deepEqual(calls[1].payload, { daily_pickup_goal: 10, user_id: 'current-user' });
  await assert.rejects(
    digitalWellbeingService.upsertAppLimit({
      app_identifier: 'social',
      app_name: 'Social',
      daily_limit_seconds: -1,
      warning_before_seconds: 60,
      is_enabled: true,
    }),
  );
  assert.equal(calls.length, 2);
});

beforeEach((t) => {
  t.mock.method(accountService, 'getClient', async () => ({
    supabase,
    userId: '11111111-1111-4111-8111-111111111111',
  }));
});

test('workout timestamps round-trip through the saved Supabase record', async (t) => {
  const { gymService } = await import('../src/features/gym/services/supabase.ts');
  const log = {
    id: 'session',
    date: '2026-10-05',
    startedAt: '2026-10-05T05:00:00.000Z',
    completedAt: '2026-10-05T06:00:00.000Z',
    completed: true,
    exercises: [],
  };
  const calls = mockRequests(t, ({ payload }) => ({
    data: { workout_data: payload.workout_data },
    error: null,
  }));
  assert.deepEqual(await gymService.upsertWorkoutLog(log.date, log), log);
  assert.equal(calls[0].payload.workout_data.startedAt, log.startedAt);
  assert.equal(calls[0].payload.workout_data.completedAt, log.completedAt);
  assert.equal(calls[0].single, true);
});

test('workout save rejects backend errors and missing persisted rows', async (t) => {
  const { gymService } = await import('../src/features/gym/services/supabase.ts');
  let result = { data: null, error: { code: '42501' } };
  mockRequests(t, () => result);
  await assert.rejects(gymService.upsertWorkoutLog('2026-10-05', {}), /Could not save workout/);
  result = { data: null, error: null };
  await assert.rejects(gymService.upsertWorkoutLog('2026-10-05', {}), /Could not save workout/);
});

test('scoped budget pagination executes only the selected table with ten-row bounds', async (t) => {
  const executed = [];
  mockRequests(t, (call) => {
    executed.push({ ...call });
    return {
      data: Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        title: 'Expense',
        amount: 1,
        currency: 'THB',
        date: '2026-10-18',
      })),
      count: 25,
      error: null,
    };
  });
  const result = await budgetReadService.fetchBudgetData(['expenses'], 2, {
    currency: 'THB',
    excludeFamily: 'true',
  });
  assert.deepEqual(
    executed.map((call) => [call.table, call.range]),
    [['expenses', [10, 19]]],
  );
  assert.equal(result.budgetEntries.length, 10);
  assert.equal(result.pageTotal, 25);
  assert.equal(result.walletBalances, undefined);
  assert.equal(result.loans, undefined);
  assert.deepEqual(result.entryTypes, ['expense']);
});

test('wallet hydration does not trigger transaction or other module reads', async (t) => {
  const executed = [];
  mockRequests(t, (call) => {
    executed.push(call.table);
    return emptyResult(call);
  });
  const result = await budgetReadService.fetchBudgetData(['wallets', 'settings']);
  assert.deepEqual(executed.sort(), ['budget_settings', 'current_budget']);
  assert.equal(result.budgetEntries, undefined);
});

test('a truncated budget page rejects instead of merging an incomplete success', async (t) => {
  mockRequests(t, () => ({ data: [], count: 25, error: null }));
  assert.equal(await budgetReadService.fetchBudgetData(['income'], 1), null);
});

test('paged budget reads merge into the store without clearing unrelated rows or scheduling saves', async (t) => {
  const { budgetService } = await import('../src/features/budget/services/supabase.ts');
  const { fetchBudgetPage, useBudgetStore, assertBudgetReadyForTransfer } =
    await import('../src/store/use-budget-store.ts');
  const { partitionIdentityStores, setIdentityScope } =
    await import('../src/lib/supabase/identity-scope.ts');
  setIdentityScope('pagination-test');
  const old = {
    id: 'old',
    type: 'income',
    title: 'Existing',
    amount: 1,
    currency: 'THB',
    date: '2026-10-01',
  };
  partitionIdentityStores(() => useBudgetStore.setState({ budgetEntries: [old] }));
  t.mock.method(budgetService, 'fetchBudgetData', async () => ({
    budgetEntries: [{ ...old, id: 'new', type: 'expense' }],
    pageTotal: 1,
    entryTypes: ['expense'],
  }));
  const page = await fetchBudgetPage('expenses', 1);
  assert.deepEqual(page.ids, ['new']);
  assert.deepEqual(
    useBudgetStore.getState().budgetEntries.map((row) => row.id),
    ['old', 'new'],
  );
  assert.doesNotThrow(assertBudgetReadyForTransfer);
  partitionIdentityStores(() => useBudgetStore.setState(useBudgetStore.getInitialState(), true));
  setIdentityScope(null);
});
