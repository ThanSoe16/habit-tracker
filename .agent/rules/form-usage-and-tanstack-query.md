---
trigger: always_on
---

# Forms, queries, and mutations

Keep data access, query caching, form presentation, and submission workflows
separate. The inline examples below show the pattern without requiring external
reference files. Example feature names and import aliases are placeholders for the
feature being built; inspect the receiving project's installed component contracts.

## State and transport ownership

- TanStack Query owns cached server data in new CRUD flows.
- React Hook Form owns values, validation, dirty state, and submission state.
- nuqs owns shareable list/search/filter URL state.
- Zustand owns shared client UI state; local React state owns component-local state.
- Preserve established Zustand synchronization until its whole flow is migrated.
- Use the approved Supabase browser client for Supabase and the existing HTTP client
  for existing HTTP endpoints. Do not create competing access paths or assume every
  service returns `body.data` / `body.total`.
- New business writes belong in client mutation hooks. Do not introduce Server
  Actions for mutations unless the user explicitly requests them.

## Queries and cache

Put pure data access in feature services, cache keys in `services/query-keys.ts`,
read hooks in `services/queries.ts`, and write hooks in `services/mutations.ts`.
Use the installed TanStack Query v5 API and mount its provider before consumers.
Adding a hook alone does not migrate an existing Zustand screen. Verify its
consumers and preserve existing synchronization behavior during migration.

Supabase reads must run in the browser through the project's approved browser
client. Do not fetch Supabase application data in Server Components, Server Actions,
Route Handlers/API routes, or server-side prefetch/hydration paths. Keep service-role
credentials out of browser code.

Include authenticated user identity, actual ownership scope when available, record
IDs, pagination, and every applied filter in cache keys. Centralize key factories.
Enable reads only when required identity/scope/ID is available. Do not mount an
edit form with an empty ID and leave it indefinitely pending.

Optional search/filter fields may be omitted. Required identity and validated page
parameters need not be optional. Normalize UI-only ALL values before backend
requests. Apply every supported filter in both the request and its cache key.
Preserve valid `0` and `false` values when normalizing/serializing parameters.
Never put session tokens or secrets in cache keys. Reuse the existing stale-time,
focus-refetch, cancellation, and retry policies unless the feature needs a change.

Choose retries deliberately; do not retry non-idempotent writes automatically.
Use mutation variables to capture the submitted scope and ID. Completion must
update that scope's cache even if the user changes screens meanwhile. Update detail
cache from saved rows (null after delete) and await relevant invalidation in
onSuccess. Do not unconditionally invalidate on failure. Distinguish a completed
write from a failed refresh so users do not repeat a committed operation. For an
optimistic workflow, `onSettled` reconciliation may be appropriate after cancellation
and rollback have been designed. Avoid blanket cache invalidation and retry policies.

Clear sensitive caches and cancel pending reads on identity changes/logout through
the existing auth lifecycle. Remount scoped forms and prevent stale submissions.
Account for persisted Zustand state and in-flight writes when migrating a flow;
clearing Query alone is insufficient.

## Shared form and wrappers

Create and edit with matching fields use one shared field layout receiving form,
mode, and onSubmit. Keep distinct business workflows separate when their fields
or interactions differ; do not force reuse through many conditional flags.
The shared form handles presentation; wrappers own defaults, validation, mutation
calls, notifications, navigation, and reset behavior. Services and mutation hooks
must not display toasts. Produce one success notification in the wrapper.

Use React Hook Form with Zod and installed shadcn Form primitives. Distinguish Zod
input/output types for transforming schemas. Check Button props; use standard
disabled and visible pending content unless its verified contract provides more.

- Label inputs, associate validation messages, and expose pending/error states.
- Disable inputs and submit controls during submission; await mutateAsync.
- Catch rejected submissions, retain entered values, and show a sanitized root or
  field error without an unhandled rejection.
- On successful create, clear defaults as appropriate; on successful edit, reset
  the dirty baseline to persisted values.
- Never reset on every background query update; preserve unsaved edits.
- Key wrappers by identity, ownership scope, and record ID after applying the
  project's unsaved-changes policy.
- Distinguish initial loading, initial error/retry, unavailable record, and failed
  background refresh while retaining the current form.

## Tables and deletion

Read the actual DataTable and usePagination contracts, including page numbering.
Keep pagination/search/filter state in nuqs and reset/clamp pages after changes.
Give each URL parameter one owner, preserve browser back/forward and reload behavior,
and reset cursors when filters change. Check real response and table prop shapes.
Only delete from ConfirmationDialog's confirmed action. Keep it open with an error
on failure, disable repeat confirmation while pending, and close after success.
Cancellation sends no write. Handle the last row of the final page without leaving
an inaccessible empty page.

## Example: preserve valid optional filter values

Use explicit null/undefined checks, not truthiness, when serializing filters for an
existing HTTP endpoint. These optional names illustrate a contract; add them to the
service and cache key only if the actual backend supports them.

```ts
// src/features/items/services/serialize-filters.ts
type Filters = { status?: 'ALL' | 'active' | 'archived'; minimum?: number; enabled?: boolean };

export function serializeFilters(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.status !== undefined && filters.status !== 'ALL') {
    params.set('status', filters.status);
  }
  if (filters.minimum !== undefined) params.set('minimum', String(filters.minimum));
  if (filters.enabled !== undefined) params.set('enabled', String(filters.enabled));
  return params.toString();
}

// serializeFilters({ status: 'ALL', minimum: 0, enabled: false })
// => 'minimum=0&enabled=false'
```

## Example: types and service contract

The examples use a generic item with a name. Implement this service contract in
the feature's data-access layer using the approved typed Supabase browser client
and actual generated database types. The interface is an integration contract,
not a mock implementation or a request to create an `items` database table.
Services validate inputs, select explicit columns, return persisted records, and
throw sanitized errors on failure. The authenticated session and database policies
enforce access; a `userId` argument or cache key is not authorization.

```ts
// src/features/items/types/index.ts
import { z } from 'zod';

export const itemSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Use 120 characters or fewer'),
});

export type ItemValues = z.infer<typeof itemSchema>;
export type Item = ItemValues & { id: string };
export type ItemScope = { userId: string };
export type ItemListParams = { page: number; pageSize: number; search: string };
export type ItemPage = { items: Item[]; total: number };
```

```ts
// src/features/items/services/api.ts
import type { Item, ItemListParams, ItemPage, ItemScope, ItemValues } from '../types';

export interface ItemService {
  list(scope: ItemScope, params: ItemListParams, signal: AbortSignal): Promise<ItemPage>;
  get(scope: ItemScope, id: string, signal: AbortSignal): Promise<Item | null>;
  create(scope: ItemScope, values: ItemValues): Promise<Item>;
  update(scope: ItemScope, id: string, values: ItemValues): Promise<Item>;
}
```

For these list parameters, `page` starts at one. Map URL pagination to this contract,
validate positive bounded page sizes, apply search in the service, and use stable
ordering with a unique secondary sort. Add real tenant/organization scope to both
the service and keys when the feature needs it.

## Example: query keys and client query hooks

```ts
// src/features/items/services/query-keys.ts
import type { ItemListParams, ItemScope } from '../types';

export const itemKeys = {
  scope: (scope: ItemScope) => ['items', scope.userId] as const,
  lists: (scope: ItemScope) => [...itemKeys.scope(scope), 'list'] as const,
  list: (scope: ItemScope, params: ItemListParams) => [...itemKeys.lists(scope), params] as const,
  detail: (scope: ItemScope, id: string) => [...itemKeys.scope(scope), 'detail', id] as const,
};
```

```ts
// src/features/items/services/queries.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { ItemListParams, ItemScope } from '../types';
import type { ItemService } from './api';
import { itemKeys } from './query-keys';

export function useItems(service: ItemService, scope: ItemScope, params: ItemListParams) {
  return useQuery({
    queryKey: itemKeys.list(scope, params),
    queryFn: ({ signal }) => service.list(scope, params, signal),
    enabled: Boolean(scope.userId),
    retry: false,
  });
}

export function useItem(service: ItemService, scope: ItemScope, id: string) {
  return useQuery({
    queryKey: itemKeys.detail(scope, id),
    queryFn: ({ signal }) => service.get(scope, id, signal),
    enabled: Boolean(scope.userId && id),
    retry: false,
  });
}
```

Pass one stable browser service instance from the client composition layer. Do not
pass services/functions across a Server Component boundary. Forward the signal to
the Supabase request so query cancellation can stop the read. This example uses
manual retries; introduce selective retries only for appropriate transient failures.

## Example: mutations and cache updates

```ts
// src/features/items/services/mutations.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemSchema, type ItemScope, type ItemValues } from '../types';
import type { ItemService } from './api';
import { itemKeys } from './query-keys';

type CreateInput = { scope: ItemScope; values: ItemValues };
type UpdateInput = CreateInput & { id: string };

export function useCreateItem(service: ItemService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scope, values }: CreateInput) => service.create(scope, itemSchema.parse(values)),
    retry: false,
    onSuccess: async (saved, { scope }) => {
      queryClient.setQueryData(itemKeys.detail(scope, saved.id), saved);
      await queryClient.invalidateQueries({ queryKey: itemKeys.lists(scope) });
    },
  });
}

export function useUpdateItem(service: ItemService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scope, id, values }: UpdateInput) =>
      service.update(scope, id, itemSchema.parse(values)),
    retry: false,
    onSuccess: async (saved, { scope, id }) => {
      queryClient.setQueryData(itemKeys.detail(scope, id), saved);
      await queryClient.invalidateQueries({ queryKey: itemKeys.lists(scope) });
    },
  });
}
```

Success uses the submitted scope, not a later global selection. Extend invalidation
to affected summaries when present. These calls retain Query's default non-throwing
refetch-error behavior; if refresh errors are made throwable, handle them separately
from write errors so a committed write is not reported as a failed submission.

## Example: one shared form UI

```tsx
// src/components/pages/items/_components/item-form.tsx
'use client';

import type { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { ItemValues } from '@/features/items/types';

type ItemFormProps = {
  form: UseFormReturn<ItemValues>;
  mode: 'create' | 'edit';
  onSubmit: SubmitHandler<ItemValues>;
};

export function ItemForm({ form, mode, onSubmit }: ItemFormProps) {
  const pending = form.formState.isSubmitting;
  const error = form.formState.errors.root?.server?.message;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-busy={pending}>
        <fieldset disabled={pending}>
          <legend className="sr-only">Item details</legend>
          <Flex direction="column" gap="4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={120} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <Flex justify="end">
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving…' : mode === 'create' ? 'Create item' : 'Save changes'}
              </Button>
            </Flex>
          </Flex>
        </fieldset>
      </form>
    </Form>
  );
}
```

The shared UI has no service, query, notification, or navigation dependencies.
Use the receiving project's UI wording and verified form primitives.

## Example: create and edit wrappers

```tsx
// src/components/pages/items/_components/create-item-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { itemSchema, type ItemScope, type ItemValues } from '@/features/items/types';
import type { ItemService } from '@/features/items/services/api';
import { useCreateItem } from '@/features/items/services/mutations';
import { ItemForm } from './item-form';

export function CreateItemForm({ service, scope }: { service: ItemService; scope: ItemScope }) {
  const mutation = useCreateItem(service);
  const form = useForm<ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: '' },
  });

  async function onSubmit(values: ItemValues) {
    form.clearErrors('root');
    try {
      await mutation.mutateAsync({ scope, values });
    } catch {
      form.setError('root.server', {
        message: 'Could not create the item. Your input has been kept.',
      });
      return;
    }
    form.reset({ name: '' });
    toast.success('Item created');
  }

  return <ItemForm form={form} mode="create" onSubmit={onSubmit} />;
}
```

```tsx
// src/components/pages/items/_components/edit-item-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { itemSchema, type Item, type ItemScope, type ItemValues } from '@/features/items/types';
import type { ItemService } from '@/features/items/services/api';
import { useUpdateItem } from '@/features/items/services/mutations';
import { ItemForm } from './item-form';

export function EditItemForm({
  service,
  scope,
  item,
}: {
  service: ItemService;
  scope: ItemScope;
  item: Item;
}) {
  const mutation = useUpdateItem(service);
  const form = useForm<ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: item.name },
  });

  async function onSubmit(values: ItemValues) {
    form.clearErrors('root');
    let saved: Item;
    try {
      saved = await mutation.mutateAsync({ scope, id: item.id, values });
    } catch {
      form.setError('root.server', {
        message: 'Could not save changes. Your input has been kept.',
      });
      return;
    }
    form.reset({ name: saved.name });
    toast.success('Item updated');
  }

  return <ItemForm form={form} mode="edit" onSubmit={onSubmit} />;
}
```

The schema keeps the same input/output types here. If a schema changes types with
coercion or transforms, type the form and resolver using the installed versions'
supported input/output generics. Map structured service field errors to individual
fields when available, rather than displaying raw backend messages.

## Example: edit loading, retry, and preserved input

```tsx
// src/components/pages/items/_components/item-edit-panel.tsx
'use client';

import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ItemScope } from '@/features/items/types';
import type { ItemService } from '@/features/items/services/api';
import { useItem } from '@/features/items/services/queries';
import { EditItemForm } from './edit-item-form';

type ItemEditPanelProps = { service: ItemService; scope: ItemScope; id: string };

export function ItemEditPanel(props: ItemEditPanelProps) {
  if (!props.scope.userId || !props.id) return <p>Select an item after signing in.</p>;
  return <LoadedItemEditPanel key={`${props.scope.userId}:${props.id}`} {...props} />;
}

function LoadedItemEditPanel({ service, scope, id }: ItemEditPanelProps) {
  const query = useItem(service, scope, id);

  if (query.isPending) {
    return <Skeleton className="h-32 w-full" aria-label="Loading item" />;
  }
  if (query.isError && query.data === undefined) {
    return (
      <Flex direction="column" gap="3">
        <p role="alert">Could not load this item.</p>
        <Button
          type="button"
          disabled={query.isFetching}
          onClick={() => {
            void query.refetch();
          }}
        >
          Retry
        </Button>
      </Flex>
    );
  }
  if (!query.data) return <p>This item is unavailable or you do not have access.</p>;

  return (
    <Flex direction="column" gap="4">
      {query.isError && <p role="status">Refresh failed. Your current form has been kept.</p>}
      <EditItemForm service={service} scope={scope} item={query.data} />
    </Flex>
  );
}
```

Initialize a stable QueryClient in a client provider above these consumers. The
authenticated client shell supplies verified identity and the browser service,
clears/cancels sensitive queries on session changes, and prevents stale submissions.
Key create wrappers by identity and actual ownership scope too. Before changing
scope or record, apply the project's unsaved-changes policy. Do not add a reset
effect on every query update: keep dirty input until save or an explicit reload.
