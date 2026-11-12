import type { StoreApi } from 'zustand';
import { partitionIdentityStores } from '@/lib/supabase/identity-scope';
import { partitionStore, type ScopedStore } from '@/lib/supabase/partition-store';

export type AccountStore = {
  reset: (userId: string | null) => void;
  hydrate?: () => void | Promise<void>;
};

export function memoryAccountStore<T>(store: StoreApi<T>): AccountStore {
  return { reset: () => store.setState(store.getInitialState(), true) };
}

export function persistedAccountStore<T>(store: ScopedStore<T>, prefix: string): AccountStore {
  return {
    reset: (userId) => {
      partitionStore(store, `${prefix}:${userId ?? 'signed-out'}`, false);
    },
    hydrate: async () => {
      await store.persist.rehydrate();
      if (!store.persist.hasHydrated()) throw new Error('Could not open your saved data.');
    },
  };
}

/** Only visited features load their stores. Loaded stores reset synchronously on
 * account changes, including cancellation of any unfinished hydration. */
export function createAccountStoreLifecycle<T extends string>(
  loaders: Record<T, () => Promise<AccountStore>>,
) {
  let userId: string | null = null;
  let generation = 0;
  const stores = new Map<T, AccountStore>();
  const imports = new Map<T, Promise<AccountStore>>();
  const hydrations = new Map<T, Promise<void>>();

  function assertAccount(expectedUserId: string, expectedGeneration: number) {
    if (userId !== expectedUserId || generation !== expectedGeneration)
      throw new Error('Your session changed. Please reload.');
  }

  function load(target: T) {
    let pending = imports.get(target);
    if (!pending) {
      pending = loaders[target]().then((store) => {
        stores.set(target, store);
        partitionIdentityStores(() => store.reset(userId));
        return store;
      });
      imports.set(target, pending);
      void pending.catch(() => imports.delete(target));
    }
    return pending;
  }

  return {
    selectAccount(nextUserId: string | null) {
      if (userId === nextUserId) return;
      userId = nextUserId;
      generation++;
      hydrations.clear();
      partitionIdentityStores(() => stores.forEach((store) => store.reset(userId)));
    },
    async prepare(targets: readonly T[], expectedUserId: string) {
      const expectedGeneration = generation;
      assertAccount(expectedUserId, expectedGeneration);
      await Promise.all(
        targets.map(async (target) => {
          const store = await load(target);
          assertAccount(expectedUserId, expectedGeneration);
          let pending = hydrations.get(target);
          if (!pending) {
            pending = Promise.resolve().then(() => {
              assertAccount(expectedUserId, expectedGeneration);
              return store.hydrate?.();
            });
            hydrations.set(target, pending);
            void pending.catch(() => {
              if (hydrations.get(target) === pending) hydrations.delete(target);
            });
          }
          await pending;
          assertAccount(expectedUserId, expectedGeneration);
        }),
      );
    },
  };
}
