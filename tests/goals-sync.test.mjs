import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accountService } from '../src/lib/supabase/account-client.ts';
import { goalsService } from '../src/features/goals/services/supabase.ts';
import { syncGoalsDelta } from '../src/features/goals/store/goals-sync.ts';

const now = '2026-09-25T00:00:00.000Z';
const goal = {
  id: '00000000-0000-4000-8000-000000000001',
  title: 'Buy House',
  why: '',
  targetDate: '',
  targetAmount: 300000000,
  currency: 'MMK',
  places: [],
  subIdeas: [],
  savings: [],
  status: 'idea',
  completionNote: '',
  energyScore: null,
  completedAt: null,
  createdAt: now,
  updatedAt: now,
};
const row = {
  id: goal.id,
  title: goal.title,
  why: goal.why,
  target_date: null,
  target_amount: goal.targetAmount,
  currency: goal.currency,
  places: goal.places,
  sub_ideas: goal.subIdeas,
  savings: goal.savings,
  status: goal.status,
  completion_note: goal.completionNote,
  energy_score: goal.energyScore,
  completed_at: goal.completedAt,
  created_at: goal.createdAt,
  updated_at: goal.updatedAt,
};
const settings = { showCompletedOnHome: true };

test('goal sync writes only changed records and settings', async (t) => {
  const calls = [];
  t.mock.method(goalsService, 'saveGoal', async (value) => {
    calls.push(['save', value.id]);
    return value;
  });
  t.mock.method(goalsService, 'deleteGoal', async (id) => {
    calls.push(['delete', id]);
  });
  t.mock.method(goalsService, 'saveSettings', async (value) => {
    calls.push(['settings', value.showCompletedOnHome]);
    return value;
  });

  await syncGoalsDelta({ goals: [goal], settings }, { goals: [], settings });
  assert.deepEqual(calls, [['save', goal.id]]);

  calls.length = 0;
  await syncGoalsDelta(
    { goals: [{ ...goal, status: 'planning' }], settings: { showCompletedOnHome: false } },
    { goals: [goal], settings },
  );
  assert.deepEqual(calls, [
    ['save', goal.id],
    ['settings', false],
  ]);

  calls.length = 0;
  await syncGoalsDelta({ goals: [], settings }, { goals: [goal], settings });
  assert.deepEqual(calls, [['delete', goal.id]]);
});

test('unchanged goal snapshots do not issue writes', async (t) => {
  t.mock.method(goalsService, 'saveGoal', () => assert.fail('Unexpected save'));
  t.mock.method(goalsService, 'deleteGoal', () => assert.fail('Unexpected delete'));
  t.mock.method(goalsService, 'saveSettings', () => assert.fail('Unexpected setting save'));
  await syncGoalsDelta({ goals: [goal], settings }, { goals: [{ ...goal }], settings });
});

test('failed goal writes reject so the queue can retry', async (t) => {
  t.mock.method(goalsService, 'saveGoal', async () => {
    throw new Error('Offline');
  });
  await assert.rejects(
    syncGoalsDelta({ goals: [goal], settings }, { goals: [], settings }),
    /Offline/,
  );
});

test('a failed cloud read is not treated as an empty goal list', async (t) => {
  const query = {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    order() {
      return this;
    },
    range() {
      return Promise.resolve({ data: null, error: { code: 'NETWORK' }, count: null });
    },
  };
  t.mock.method(accountService, 'getClient', async () => ({
    userId: goal.id,
    supabase: { from: () => query },
  }));
  await assert.rejects(goalsService.fetchSnapshot(), /Could not load complete data/);
});

test('existing goal updates only editable columns', async (t) => {
  let payload;
  const filters = [];
  const query = {
    update(value) {
      payload = value;
      return this;
    },
    eq(...args) {
      filters.push(args);
      return this;
    },
    select() {
      return this;
    },
    maybeSingle() {
      return Promise.resolve({ data: row, error: null });
    },
    insert() {
      assert.fail('Existing goal should not be inserted');
    },
  };
  t.mock.method(accountService, 'getClient', async () => ({
    userId: goal.id,
    supabase: { from: () => query },
  }));
  assert.deepEqual(await goalsService.saveGoal(goal), goal);
  assert.equal(payload.target_amount, 300000000);
  for (const column of ['id', 'created_at', 'user_id'])
    assert.equal(Object.hasOwn(payload, column), false);
  assert.deepEqual(filters, [
    ['id', goal.id],
    ['user_id', goal.id],
  ]);
});

test('new goal inserts protected fields and requires the persisted row', async (t) => {
  let payload;
  let insertResult = { data: row, error: null };
  const query = {
    update() {
      return this;
    },
    eq() {
      return this;
    },
    select() {
      return this;
    },
    maybeSingle() {
      return Promise.resolve({ data: null, error: null });
    },
    insert(value) {
      payload = value;
      return this;
    },
    single() {
      return Promise.resolve(insertResult);
    },
  };
  t.mock.method(accountService, 'getClient', async () => ({
    userId: goal.id,
    supabase: { from: () => query },
  }));
  assert.deepEqual(await goalsService.saveGoal(goal), goal);
  assert.equal(payload.id, goal.id);
  assert.equal(payload.created_at, goal.createdAt);
  assert.equal(Object.hasOwn(payload, 'user_id'), false);
  insertResult = { data: null, error: null };
  await assert.rejects(goalsService.saveGoal(goal), /Could not save this goal/);
});

test('a duplicate insert retries the owner-scoped update', async (t) => {
  let updates = 0;
  const query = {
    update() {
      updates++;
      return this;
    },
    eq() {
      return this;
    },
    select() {
      return this;
    },
    maybeSingle() {
      return Promise.resolve({ data: updates === 1 ? null : row, error: null });
    },
    insert() {
      return this;
    },
    single() {
      return Promise.resolve({ data: null, error: { code: '23505' } });
    },
  };
  t.mock.method(accountService, 'getClient', async () => ({
    userId: goal.id,
    supabase: { from: () => query },
  }));
  assert.deepEqual(await goalsService.saveGoal(goal), goal);
  assert.equal(updates, 2);
});
