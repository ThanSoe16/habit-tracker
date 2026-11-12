import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from 'zustand/vanilla';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  createAccountStoreLifecycle,
  persistedAccountStore,
} from '../src/features/sync/account-store-lifecycle.ts';
import { routeStoreTargets } from '../src/features/sync/route-targets.ts';

function deferred() {
  let resolve;
  const promise = new Promise((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

function savedStore(getItem) {
  return createStore(
    persist(() => ({ records: [] }), {
      name: 'legacy',
      skipHydration: true,
      storage: createJSONStorage(() => ({
        getItem,
        setItem: () => assert.fail('Reset/hydration must not overwrite stored drafts'),
        removeItem: () => assert.fail('Stored drafts must be retained'),
      })),
    }),
  );
}

test('habit routes need no unrelated stores; feature routes select their own stores', () => {
  assert.deepEqual(routeStoreTargets('/habits/today'), []);
  assert.deepEqual(routeStoreTargets('/account'), []);
  assert.deepEqual(routeStoreTargets('/managements/create'), []);
  assert.deepEqual(routeStoreTargets('/workout/today'), ['gym']);
  assert.deepEqual(routeStoreTargets('/managements/plan'), ['gym']);
  assert.deepEqual(routeStoreTargets('/budget-generals/settings'), ['budget']);
  assert.deepEqual(routeStoreTargets('/goals/create'), ['goals']);
  assert.deepEqual(routeStoreTargets('/store/gallery'), ['media']);
  assert.deepEqual(routeStoreTargets('/digital-wellbeing/focus'), ['wellbeing', 'focus']);
});

test('stores load only on demand, hydrate once, and reset even after leaving their route', async () => {
  const events = [];
  const lifecycle = createAccountStoreLifecycle({
    budget: async () => {
      events.push('import');
      return {
        reset: (userId) => events.push(['reset', userId]),
        hydrate: () => events.push('hydrate'),
      };
    },
  });
  lifecycle.selectAccount('alice');
  await lifecycle.prepare([], 'alice');
  assert.deepEqual(events, []);
  await Promise.all([
    lifecycle.prepare(['budget'], 'alice'),
    lifecycle.prepare(['budget'], 'alice'),
  ]);
  await lifecycle.prepare(['budget'], 'alice');
  assert.deepEqual(events, ['import', ['reset', 'alice'], 'hydrate']);
  lifecycle.selectAccount('alice');
  lifecycle.selectAccount('bob');
  assert.deepEqual(events.at(-1), ['reset', 'bob']);
  await lifecycle.prepare(['budget'], 'bob');
  assert.equal(events.filter((event) => event === 'import').length, 1);
  assert.equal(events.filter((event) => event === 'hydrate').length, 2);
  lifecycle.selectAccount(null);
  assert.deepEqual(events.at(-1), ['reset', null]);
});

test('an import finishing after an account switch cannot hydrate the previous account', async () => {
  const imported = deferred();
  const events = [];
  const lifecycle = createAccountStoreLifecycle({ media: () => imported.promise });
  lifecycle.selectAccount('alice');
  const old = lifecycle.prepare(['media'], 'alice');
  const rejected = assert.rejects(old, /session changed/);
  lifecycle.selectAccount('bob');
  imported.resolve({
    reset: (userId) => events.push(['reset', userId]),
    hydrate: () => events.push('hydrate'),
  });
  await rejected;
  assert.deepEqual(events, [['reset', 'bob']]);
  await lifecycle.prepare(['media'], 'bob');
  assert.deepEqual(events, [['reset', 'bob'], 'hydrate']);
});

test('logout cancels a persisted read without loading another account or overwriting storage', async () => {
  const read = deferred();
  const started = deferred();
  const store = savedStore((key) => {
    assert.equal(key, 'feature:alice');
    started.resolve();
    return read.promise;
  });
  const lifecycle = createAccountStoreLifecycle({
    feature: async () => persistedAccountStore(store, 'feature'),
  });
  lifecycle.selectAccount('alice');
  const old = lifecycle.prepare(['feature'], 'alice');
  const rejected = assert.rejects(old, /session changed/);
  await started.promise;
  lifecycle.selectAccount(null);
  read.resolve(JSON.stringify({ state: { records: ['private alice'] }, version: 0 }));
  await rejected;
  assert.deepEqual(store.getState().records, []);
  assert.equal(store.persist.getOptions().name, 'feature:signed-out');
});

test('failed hydration can retry and each account restores only its own saved data', async () => {
  let fail = true;
  const store = savedStore((key) => {
    if (fail) throw new Error('Storage unavailable');
    return JSON.stringify({ state: { records: [key] }, version: 0 });
  });
  const lifecycle = createAccountStoreLifecycle({
    feature: async () => persistedAccountStore(store, 'feature'),
  });
  lifecycle.selectAccount('alice');
  await assert.rejects(lifecycle.prepare(['feature'], 'alice'), /Could not open/);
  assert.deepEqual(store.getState().records, []);
  fail = false;
  await lifecycle.prepare(['feature'], 'alice');
  assert.deepEqual(store.getState().records, ['feature:alice']);
  lifecycle.selectAccount('bob');
  assert.deepEqual(store.getState().records, []);
  await lifecycle.prepare(['feature'], 'bob');
  assert.deepEqual(store.getState().records, ['feature:bob']);
});

test('a failed code import can be retried', async () => {
  let attempts = 0;
  const lifecycle = createAccountStoreLifecycle({
    feature: async () => {
      if (++attempts === 1) throw new Error('Chunk unavailable');
      return { reset: () => {} };
    },
  });
  lifecycle.selectAccount('alice');
  await assert.rejects(lifecycle.prepare(['feature'], 'alice'), /Chunk unavailable/);
  await lifecycle.prepare(['feature'], 'alice');
  assert.equal(attempts, 2);
});
