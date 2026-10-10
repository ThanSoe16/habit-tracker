import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createQueuedStorage } from '../src/lib/native/queued-storage.ts';
import { goalsService } from '../src/features/goals/services/supabase.ts';
import { setIdentityScope } from '../src/lib/supabase/identity-scope.ts';
import {
  countPendingGoals,
  emptyGoalsSnapshot,
  reconcileGoals,
  syncManualGoals,
} from '../src/features/goals/services/manual-sync.ts';

process.env.NEXT_PUBLIC_NATIVE_APP = 'true';
const records = new Map();
globalThis.localStorage = {
  getItem: (key) => records.get(key) ?? null,
  setItem: (key, value) => records.set(key, value),
  removeItem: (key) => records.delete(key),
};
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
const { useGoalsStore } = await import('../src/features/goals/store/use-goals-store.ts');
const { nativeStorage } = await import('../src/lib/native/sqlite-storage.ts');
const { useNativeStatus } = await import('../src/lib/native/status.ts');
const { hydrateNativeGoals } = await import('../src/features/goals/services/native-hydration.ts');
const { runNativeGoalsSync } = await import('../src/features/goals/services/native-sync.ts');

const userId = '00000000-0000-4000-8000-000000000001';
const otherId = '00000000-0000-4000-8000-000000000002';
const now = '2026-10-03T00:00:00.000Z';
const goal = {
  id: '00000000-0000-4000-8000-000000000010',
  title: 'A goal',
  why: '',
  targetDate: '',
  targetAmount: null,
  currency: 'USDT',
  savings: [],
  places: [],
  subIdeas: [],
  status: 'idea',
  completionNote: '',
  energyScore: null,
  completedAt: null,
  createdAt: now,
  updatedAt: now,
};
const snapshot = (goals = [goal], settings = { showCompletedOnHome: true }) => ({
  goals,
  settings,
});
const remote = (goals = [goal], settings) => ({ userId, ...snapshot(goals, settings) });

test('SQLite retains the cloud baseline and pending deletions after reopening', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'native-goals-'));
  const path = join(directory, 'goals.db');
  let db = new DatabaseSync(path);
  db.exec(
    readFileSync(new URL('../src-tauri/migrations/001_local_state.sql', import.meta.url), 'utf8'),
  );
  const storage = {
    getItem: (key) =>
      db.prepare('SELECT value FROM local_state WHERE key = $1').get({ $1: key })?.value ?? null,
    setItem: (key, value) =>
      db
        .prepare(
          'INSERT INTO local_state (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        )
        .run({ $1: key, $2: value }),
    removeItem: (key) => db.prepare('DELETE FROM local_state WHERE key = $1').run({ $1: key }),
  };
  const first = createQueuedStorage(
    async () => storage,
    () => {},
  );
  await first.storage.setItem(
    `native-goals:${userId}`,
    JSON.stringify({ state: { ...snapshot([]), cloudSnapshot: snapshot() }, version: 4 }),
  );
  await first.flush();
  db.close();
  db = new DatabaseSync(path);
  const reopened = createQueuedStorage(
    async () => storage,
    () => {},
  );
  const { state } = JSON.parse(await reopened.storage.getItem(`native-goals:${userId}`));
  assert.equal(countPendingGoals(state, state.cloudSnapshot), 1);
  assert.equal(await reopened.storage.getItem(`native-goals:${otherId}`), null);
  assert.throws(() =>
    db.prepare('INSERT INTO local_state VALUES (?, ?)').run('bad', 'invalid JSON'),
  );
  db.close();
  rmSync(directory, { recursive: true });
});

test('failed device saves retain the latest draft and retry it in order', async () => {
  const saved = new Map();
  let failing = true;
  const queue = createQueuedStorage(
    async () => ({
      getItem: (key) => saved.get(key) ?? null,
      setItem: (key, value) => {
        if (failing) throw new Error('Disk unavailable');
        saved.set(key, value);
      },
      removeItem: (key) => saved.delete(key),
    }),
    () => {},
  );
  void queue.storage.setItem('a', 'old');
  void queue.storage.setItem('a', 'new');
  await assert.rejects(queue.flush(), /Disk unavailable/);
  await assert.rejects(queue.storage.getItem('a'), /not been saved/);
  failing = false;
  await queue.retry();
  assert.equal(await queue.storage.getItem('a'), 'new');
});

test('reconciliation preserves edits, additions, deletions and settings made during sync', () => {
  const added = { ...goal, id: otherId, title: 'Added during sync' };
  const cloudOnly = { ...goal, id: userId, title: 'From another device' };
  const submitted = snapshot([goal, { ...goal, id: '00000000-0000-4000-8000-000000000011' }]);
  const current = snapshot([{ ...goal, title: 'Edited during sync' }, added], {
    showCompletedOnHome: false,
  });
  const result = reconcileGoals(current, submitted, snapshot([...submitted.goals, cloudOnly]));
  assert.deepEqual(result.goals.map((value) => value.title).sort(), [
    'Added during sync',
    'Edited during sync',
    'From another device',
  ]);
  assert.equal(result.settings.showCompletedOnHome, false);
});

test('manual sync verifies the submitting account before any write', async (t) => {
  setIdentityScope(userId);
  t.mock.method(goalsService, 'fetchSnapshot', async () => ({ ...remote([]), userId: otherId }));
  t.mock.method(goalsService, 'saveGoal', () => assert.fail('Unexpected write'));
  await assert.rejects(syncManualGoals(userId, snapshot(), emptyGoalsSnapshot), /session changed/);
});

test('account changes stop delta replay before the next write', async (t) => {
  setIdentityScope(userId);
  const writes = [];
  t.mock.method(goalsService, 'fetchSnapshot', async () => remote([]));
  t.mock.method(goalsService, 'saveGoal', async (value) => {
    writes.push(value.id);
    setIdentityScope(otherId);
    return value;
  });
  await assert.rejects(
    syncManualGoals(userId, snapshot([goal, { ...goal, id: otherId }]), emptyGoalsSnapshot),
    /session changed/,
  );
  assert.deepEqual(writes, [goal.id]);
});

test('hydration never starts a cloud request and restores an account-specific outbox', async (t) => {
  await nativeStorage.flush();
  records.clear();
  t.mock.method(goalsService, 'fetchSnapshot', () => assert.fail('Unexpected automatic sync'));
  await hydrateNativeGoals(userId);
  useGoalsStore.setState({ goals: [], cloudSnapshot: snapshot() });
  await nativeStorage.flush();
  await hydrateNativeGoals(otherId);
  assert.deepEqual(useGoalsStore.getState().goals, []);
  assert.equal(useGoalsStore.getState().cloudSnapshot, null);
  await hydrateNativeGoals(userId);
  assert.equal(
    countPendingGoals(useGoalsStore.getState(), useGoalsStore.getState().cloudSnapshot),
    1,
  );
  assert.equal(useGoalsStore.getState().ready, true);
});

test('failed sync survives restart and can replay deletes successfully', async (t) => {
  await hydrateNativeGoals(userId);
  useGoalsStore.setState({ goals: [], cloudSnapshot: snapshot() });
  await nativeStorage.flush();
  let failing = true;
  let deletes = 0;
  t.mock.method(goalsService, 'fetchSnapshot', async () => remote(failing ? [goal] : []));
  t.mock.method(goalsService, 'deleteGoal', async () => {
    deletes++;
    if (failing) throw new Error('Offline');
  });
  await runNativeGoalsSync();
  assert.ok(useNativeStatus.getState().syncError);
  await hydrateNativeGoals(otherId);
  await hydrateNativeGoals(userId);
  assert.equal(
    countPendingGoals(useGoalsStore.getState(), useGoalsStore.getState().cloudSnapshot),
    1,
  );
  failing = false;
  await runNativeGoalsSync();
  assert.equal(deletes, 2);
  assert.equal(useNativeStatus.getState().syncError, null);
  assert.equal(
    countPendingGoals(useGoalsStore.getState(), useGoalsStore.getState().cloudSnapshot),
    0,
  );
  assert.ok(useGoalsStore.getState().lastSyncedAt);
});

test('edits during cloud download remain pending and survive another hydration', async (t) => {
  await hydrateNativeGoals(userId);
  useGoalsStore.setState({ ...snapshot(), cloudSnapshot: snapshot() });
  await nativeStorage.flush();
  let finish;
  let downloading;
  const started = new Promise((resolve) => {
    downloading = resolve;
  });
  let reads = 0;
  t.mock.method(goalsService, 'fetchSnapshot', () => {
    if (++reads === 1) return Promise.resolve(remote());
    downloading();
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  const sync = runNativeGoalsSync();
  await started;
  useGoalsStore.getState().deleteGoal(goal.id);
  finish(remote());
  await sync;
  await hydrateNativeGoals(otherId);
  await hydrateNativeGoals(userId);
  assert.deepEqual(useGoalsStore.getState().goals, []);
  assert.equal(
    countPendingGoals(useGoalsStore.getState(), useGoalsStore.getState().cloudSnapshot),
    1,
  );
});

test('unreadable storage blocks editing without replacing the saved value', async () => {
  await nativeStorage.flush();
  const key = `native-goals:${otherId}`;
  records.set(key, 'not JSON');
  await hydrateNativeGoals(otherId);
  assert.equal(useNativeStatus.getState().hydrationError, true);
  assert.equal(useGoalsStore.getState().ready, false);
  assert.equal(records.get(key), 'not JSON');
});

test('offline sync keeps the outbox and issues no cloud requests', async (t) => {
  await hydrateNativeGoals(userId);
  t.mock.method(goalsService, 'fetchSnapshot', () => assert.fail('Unexpected offline request'));
  navigator.onLine = false;
  await runNativeGoalsSync();
  navigator.onLine = true;
  assert.match(useNativeStatus.getState().syncError, /offline/);
});

test('a hydration finishing after sign-out cannot restore the previous account', async (t) => {
  await nativeStorage.flush();
  let finish;
  t.mock.method(nativeStorage.storage, 'getItem', async (key) => {
    if (key === `native-goals:${otherId}`) {
      return new Promise((resolve) => {
        finish = resolve;
      });
    }
    return null;
  });
  const oldHydration = hydrateNativeGoals(otherId);
  await hydrateNativeGoals(null);
  finish(JSON.stringify({ state: snapshot(), version: 4 }));
  await oldHydration;
  assert.equal(useNativeStatus.getState().userId, null);
  assert.equal(useGoalsStore.getState().ready, false);
  assert.deepEqual(useGoalsStore.getState().goals, []);
});

test('an older same-account hydration cannot enable edits or persist empty defaults', async (t) => {
  await nativeStorage.flush();
  const finishes = [];
  t.mock.method(
    nativeStorage.storage,
    'getItem',
    () => new Promise((resolve) => finishes.push(resolve)),
  );
  const first = hydrateNativeGoals(userId);
  const second = hydrateNativeGoals(userId);
  finishes[0](JSON.stringify({ state: snapshot(), version: 4 }));
  await first;
  assert.equal(useNativeStatus.getState().loading, true);
  assert.equal(useGoalsStore.getState().ready, false);
  finishes[1](JSON.stringify({ state: snapshot(), version: 4 }));
  await second;
  assert.equal(useNativeStatus.getState().loading, false);
  assert.deepEqual(useGoalsStore.getState().goals, [goal]);
  await nativeStorage.flush();
});
