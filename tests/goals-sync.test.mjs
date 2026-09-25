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

test('goal upsert sends no owner field and requires the persisted row', async (t) => {
  let payload;
  const query = {
    upsert(value) {
      payload = value;
      return this;
    },
    select() {
      return this;
    },
    single() {
      return Promise.resolve({ data: null, error: null });
    },
  };
  t.mock.method(accountService, 'getClient', async () => ({
    userId: goal.id,
    supabase: { from: () => query },
  }));
  await assert.rejects(goalsService.saveGoal(goal), /Could not save this goal/);
  assert.equal(Object.hasOwn(payload, 'user_id'), false);
  assert.equal(payload.target_amount, 300000000);
});
