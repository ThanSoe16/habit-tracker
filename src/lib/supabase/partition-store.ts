import type { StoreApi } from 'zustand';
import type { PersistStorage } from 'zustand/middleware';

export type ScopedStore<T> = StoreApi<T> & {
  persist: {
    getOptions: () => { storage?: PersistStorage<T> };
    setOptions: (options: { name?: string; storage?: PersistStorage<T> }) => void;
    rehydrate: () => void | Promise<void>;
    hasHydrated: () => boolean;
  };
};

/** Reset memory without overwriting either account's saved snapshot. */
export function partitionStore<T>(store: ScopedStore<T>, name: string, hydrate: boolean) {
  const { storage } = store.persist.getOptions();
  store.persist.setOptions({
    storage: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    },
  });
  store.setState(store.getInitialState(), true);
  // Zustand versions hydrations. An empty read cancels a prior account's async
  // read even when the next feature will not hydrate until its route is visited.
  void store.persist.rehydrate();
  store.persist.setOptions({ storage, name });
  if (hydrate) return store.persist.rehydrate();
}
