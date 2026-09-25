---
trigger: always_on
---

# Zustand state management

Use the installed Zustand v5 API; check `package.json` and `pnpm-lock.yaml` before
using version-specific patterns. These rules guide new code and changes to existing
stores; they do not imply every legacy store already follows them.

## State ownership

Give each piece of state one owner so updates cannot drift between copies.

| State | Owner |
| --- | --- |
| State used by one component | Local React state |
| Shared client UI state | Zustand |
| Form values, validation, and dirty state | React Hook Form |
| Shareable search, filters, and pagination | nuqs |
| Server data in new CRUD flows | TanStack Query through feature services |
| Existing synchronized domain state | Its established Zustand store until a complete migration |

Do not copy Query results into a store just to share them between components.
Preserve existing persistence, optimistic updates, save queues, and retries when
changing legacy flows. Migrate all affected consumers together; never introduce
competing Query and Zustand writes for the same data. Keep feature services pure
and notifications in UI callers.

## Store structure and actions

- Reuse an existing store when it owns the same state. Keep stores focused on one
  domain rather than creating one application-wide store for unrelated features.
- Put feature-owned stores in `src/features/<feature>/store/` and application-wide
  stores in `src/store/`. Preserve established import paths when adapting legacy stores.
  New files use kebab-case, for example `use-selection-store.ts`.
- Define separate state and action types and combine them with
  `create<State & Actions>()(...)`. Avoid `any` and untyped action payloads.
- Prefer named domain actions over exposing a generic setter for arbitrary fields.
  Components call actions; reserve direct `setState` for deliberate lifecycle or
  synchronization infrastructure.
- Use functional `set` when the next value depends on current state. Update arrays
  and nested objects immutably; the default merge is shallow.
- Keep derived values out of state when they can be computed from existing fields.
  Compute expensive derived collections from selected inputs with memoization when needed.
- Provide an explicit reset for state that must clear on route, workflow, or identity
  changes. Reset data without removing actions; use fresh arrays/objects for defaults.
- Keep navigation, component callbacks, and toast notifications in the UI layer.
  Clean up subscriptions, timers, and listeners in their owning lifecycle.

## Selectors and rendering

Subscribe only to fields and actions the component needs, rather than calling a
store hook without a selector. Use separate selectors for individual values.
For a combined object/tuple selector, use `useShallow` from `zustand/react/shallow`
when its members have stable references. Do not return freshly allocated nested
objects or fallback functions on every read. Zustand v5 requires stable selector
outputs; see the [official migration guide](https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5).

Use `getState()` for imperative event/service access, not for reactive values in
rendering. Do not create a store anew on every render. When store lifetime belongs
to a mounted subtree, use a stable store instance with a scoped provider.

## Example: reusable selection store and consumer

This illustrates a new, non-persisted UI store, not an existing export. Use it only
when multiple components need the selection. The owning page/provider must call
`reset` when its selection scope changes, including account changes for user data.

```ts
// src/features/sample/store/use-selection-store.ts
'use client';

import { create } from 'zustand';

type SelectionState = {
  selectedIds: string[];
};

type SelectionActions = {
  toggleSelection: (id: string) => void;
  reset: () => void;
};

const createInitialState = (): SelectionState => ({ selectedIds: [] });

export const useSelectionStore = create<SelectionState & SelectionActions>()((set) => ({
  ...createInitialState(),
  toggleSelection: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id],
    })),
  reset: () => set(createInitialState()),
}));
```

```tsx
// src/components/pages/sample/_components/selection-summary.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useSelectionStore } from '@/features/sample/store/use-selection-store';

export function SelectionSummary() {
  const selectedCount = useSelectionStore((state) => state.selectedIds.length);
  const reset = useSelectionStore((state) => state.reset);

  return (
    <Button type="button" variant="outline" disabled={selectedCount === 0} onClick={reset}>
      Clear selection ({selectedCount})
    </Button>
  );
}
```

The count is derived and each subscription returns a primitive or stable action.
The consumer reuses the existing Button and leaves selection updates in the store.

## Persistence and hydration

Persist only state that must survive reloads. Use a unique, stable storage name and
an explicit `partialize` allowlist. Keep transient pending/error flags, actions,
and secrets out of persisted data. Do not duplicate Supabase session credentials.
Use JSON-compatible values and validate restored data; TypeScript does not validate
browser storage. When changing stored shape, use `version` and `migrate` with a
documented recovery path for invalid data. Preserve recoverable user data.

For new browser persistence use `persist` and `createJSONStorage` from
`zustand/middleware`. Use `skipHydration: true` and explicitly rehydrate from the
owning client lifecycle. Handle completion and failure with a reactive readiness
state; a bare `persist.hasHydrated()` call does not subscribe a component to changes.
Keep the initial render deterministic and avoid displaying account data until the
correct account's hydration completes. See the [official persistence guide](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data).

For account-owned stores, reuse the project's auth lifecycle and store-partitioning
helpers for account-specific storage and resets. Verify their actual contracts.
Coordinate reset, storage-key switching, hydration, and pending work in that
lifecycle. Clearing storage alone does not clear memory; resetting a persisted
store can write defaults to storage. Do not overwrite another account's snapshot.

## Example: persist only a device preference

This independent example keeps selection in memory and persists only view mode.
It is device-wide and contains no account data. The owning client boundary calls
`rehydrate()` after mount, disables store actions until hydration finishes, and
shows a retry/error state on failure. Hydrate once in that boundary, not in every
consumer. The callbacks connect its reactive readiness state without persisting it.

```ts
// src/features/sample/store/create-view-store.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { z } from 'zod';

const preferenceSchema = z.object({ viewMode: z.enum(['grid', 'list']) });
type ViewState = z.infer<typeof preferenceSchema> & { selectedIds: string[] };
type ViewActions = {
  setViewMode: (viewMode: ViewState['viewMode']) => void;
  toggleSelection: (id: string) => void;
  reset: () => void;
};
type HydrationCallbacks = {
  onStart: () => void;
  onFinish: (error?: unknown) => void;
};

const createInitialState = (): ViewState => ({ viewMode: 'list', selectedIds: [] });

export function createViewStore(callbacks: HydrationCallbacks) {
  return create<ViewState & ViewActions>()(
    persist(
      (set) => ({
        ...createInitialState(),
        setViewMode: (viewMode) => set({ viewMode }),
        toggleSelection: (id) =>
          set((state) => ({
            selectedIds: state.selectedIds.includes(id)
              ? state.selectedIds.filter((selectedId) => selectedId !== id)
              : [...state.selectedIds, id],
          })),
        reset: () => set(createInitialState()),
      }),
      {
        name: 'sample-view-preferences',
        version: 1,
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,
        partialize: (state) => ({ viewMode: state.viewMode }),
        merge: (persisted, current) => ({
          ...current,
          ...(persisted === undefined ? {} : preferenceSchema.parse(persisted)),
        }),
        onRehydrateStorage: () => {
          callbacks.onStart();
          return (_state, error) => callbacks.onFinish(error);
        },
      },
    ),
  );
}
```

Create the store once per owning client provider with stable callbacks and expose
that instance to consumers. `onFinish` handles errors and component unmounts, not
merely readiness. Do not mutate the store while recovering unreadable storage,
since that can overwrite the saved value. If an earlier version exists, add a
tested `migrate` function before incrementing the version; do not silently discard
recoverable preferences. Account-owned state also needs an identity-scoped key and
lifecycle cleanup; do not copy this device key for it.

## Supabase synchronization and client boundaries

Consume stores from client components/hooks. Do not read or mutate browser singleton
stores from Server Components, Server Actions, or Route Handlers, or initialize
them with request-specific user data on the server. All Supabase application reads
run in the browser through the approved client and feature services, including
legacy synchronization. Do not add server-side prefetch/hydration paths.

Existing async store actions call feature services. Keep network effects outside
`set` updater functions and rendering. Await operations whose completion matters;
background work needs an explicit error and retry policy. Preserve the last valid
snapshot on refresh failure and distinguish a local update from a confirmed save.
Guard late results using the existing identity revision and queue revision patterns
so old requests cannot replace newer edits or populate a different account's state.
Preserve rollback/reconciliation behavior and prevent remote refreshes or lifecycle
resets from feeding back into save subscriptions.

## Verification

For changed store behavior, check immutable updates, reset retaining actions,
selector stability, persistence round trips and migrations, hydration failure,
logout/account switching, stale async results, and queue retry/rollback as applicable.
Use existing focused tests and report what was actually verified. Adding this
documentation alone does not require application regression tests.
