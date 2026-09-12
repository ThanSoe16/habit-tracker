import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setIdentityScope } from '../src/lib/supabase/identity-scope.ts';
import { createSaveQueue } from '../src/features/settings/save-queue.ts';
import { createBudgetSyncScheduler } from '../src/features/budget/store/budget-sync.ts';
import { accountService } from '../src/lib/supabase/account-client.ts';
import { supabase } from '../src/lib/supabase/client.ts';
import { useMoodStore } from '../src/store/use-mood-store.ts';
import { moodService } from '../src/features/mood/services/supabase.ts';

const tick = () => new Promise((resolve) => setTimeout(resolve, 10));

test('failed profile drafts and queued saves cannot run under a new account', async () => {
  setIdentityScope('a');
  let finish;
  const writes = [];
  const queue = createSaveQueue(
    (value) => {
      writes.push(value);
      return value === 'a-running'
        ? new Promise((resolve) => {
            finish = resolve;
          })
        : Promise.resolve();
    },
    () => {},
  );
  queue.save('a-running');
  queue.save('a-pending');
  setIdentityScope('b');
  queue.retry();
  queue.save('b-save');
  finish();
  await tick();
  assert.deepEqual(writes, ['a-running', 'b-save']);
  assert.equal(queue.hasPending, false);
});

test('budget debounce and failed retry batches are discarded on account change', async () => {
  setIdentityScope('a');
  const writes = [];
  const scheduler = createBudgetSyncScheduler(1, async (current) => {
    writes.push(current.currency);
    throw new Error('offline');
  });
  scheduler.schedule({ currency: 'A' }, { currency: 'initial' });
  await tick();
  setIdentityScope('b');
  assert.equal(scheduler.hasPending, false);
  scheduler.schedule({ currency: 'B' }, { currency: 'initial' });
  setIdentityScope('c');
  await tick();
  assert.deepEqual(writes, ['A']);
});

test('an old mood response cannot populate a newly selected account', async (t) => {
  setIdentityScope('a');
  let finish;
  t.mock.method(
    moodService,
    'fetchMoods',
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = useMoodStore.getState().fetchFromSupabase();
  setIdentityScope('b');
  useMoodStore.setState(useMoodStore.getInitialState(), true);
  finish({ '2026-09-12': { mood: 'Private A' } });
  await assert.rejects(pending, /session changed/);
  assert.deepEqual(useMoodStore.getState().history, {});
});

test('account client rejects a session that changes while it is being obtained', async (t) => {
  setIdentityScope('a');
  let finish;
  t.mock.method(
    supabase.auth,
    'getSession',
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = accountService.getClient();
  setIdentityScope('b');
  finish({ data: { session: { user: { id: 'a' }, access_token: 'token-a' } }, error: null });
  await assert.rejects(pending, /session changed/);
});

test('captured clients do not send requests with a replacement account token', async (t) => {
  setIdentityScope('a');
  t.mock.method(supabase.auth, 'getSession', async () => ({
    data: { session: { user: { id: 'a' }, access_token: 'token-a' } },
    error: null,
  }));
  const { supabase: captured } = await accountService.getClient();
  setIdentityScope('b');
  const fetch = t.mock.method(globalThis, 'fetch', () => {
    throw new Error('Unexpected network');
  });
  const result = await captured.from('habits').select('id');
  assert.ok(result.error);
  assert.equal(fetch.mock.callCount(), 0);
});

test('an old pending habit write does not prevent the next account from loading', async (t) => {
  const { useHabitStore } = await import('../src/store/use-habit-store.ts');
  const { default: habitsApi } = await import('../src/features/habits/services/api.ts');
  const { habitsService } = await import('../src/features/habits/services/supabase.ts');
  setIdentityScope('habit-a');
  useHabitStore.setState(useHabitStore.getInitialState(), true);
  let finish;
  t.mock.method(
    habitsApi,
    'saveHabit',
    (habit) =>
      new Promise((resolve) => {
        finish = () => resolve(habit);
      }),
  );
  const oldSave = useHabitStore.getState().addHabit('A private habit', 'blue', 'daily', []);
  setIdentityScope('habit-b');
  useHabitStore.setState(useHabitStore.getInitialState(), true);
  t.mock.method(habitsApi, 'getHabits', async () => []);
  t.mock.method(habitsService, 'fetchCustomUnits', async () => []);
  await useHabitStore.getState().fetchFromSupabase();
  assert.equal(useHabitStore.getState().isLoaded, true);
  finish();
  await assert.rejects(oldSave, /session changed/);
  assert.deepEqual(useHabitStore.getState().habits, []);
});
