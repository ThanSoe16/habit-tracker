---
trigger: always_on
---

# Database and data access

Keep database authorization and pure data-access services explicit. The inline SQL
and TypeScript examples below show a complete pattern without external reference
files. Example table names and import paths are placeholders for the receiving
project's schema and structure, not instructions to add a sample feature.

## Authorization and integrity

Inspect the actual schema, grants, policies, and migration history before changes.
Do not assume a tenant or owner column exists. Establish the intended ownership
model and a valid backfill for existing rows before changing it. Never assign
legacy data to an arbitrary user, delete it to simplify migration, or treat a
route guard/cache key as database authorization.

Use grants, RLS, foreign keys, and constraints together. Every affected operation
must have explicit allow/deny behavior for ordinary user clients. Scope filters
select data; only database authorization grants access. Prevent clients from
changing protected ownership/membership fields. Include USING and WITH CHECK
where applicable, and avoid recursive membership policies. Keep provisioning
within trusted tooling. Never expose service-role credentials to the browser.

Add incremental migrations; inspect existing grants and policies, including
permissive policies that could defeat new restrictions. Use a disposable local
database for policy testing. Do not apply examples to a hosted database implicitly.

## Client-side Supabase data fetching

Fetch application data from Supabase only in the browser, using the project's
approved browser client through feature services and client-side
query hooks or established Zustand synchronization flows. Do not fetch Supabase
data in Server Components, server-rendered pages/layouts, Server Actions, or
Route Handlers/API routes, including server-side prefetching for hydration.
Server pages and layouts may compose client components that own data fetching.
Keep service-role credentials out of browser code; database migrations and trusted
administrative tooling remain separate from application data fetching.

## Types and services

Generate Database types from the actual migrated database before introducing a
`SupabaseClient<Database>` contract. Use the receiving project's generated type
export and generation command. Do not fabricate types, hand-edit generated output,
or label handwritten Zod/domain types as generated. If generation is unavailable,
record the missing prerequisite rather than inventing a database contract.

For new services, inject the approved typed client and keep React, cookies, toasts,
and navigation outside data access. When adapting legacy service contracts, update
all consumers and verify error handling, including background synchronization.

- Validate IDs, filters, pagination bounds, and write payloads before requests.
  Match real ID types; not every project or table uses UUIDs.
- Select explicit columns and map only editable write fields; do not spread fetched
  rows into updates or trust client-supplied ownership.
- Reject failed or incomplete reads; never turn request failure into a successful
  empty list, zero balance, or missing detail. An explicitly documented legacy sync
  adapter may return a failure sentinel to retain its last valid snapshot.
- Use deterministic bounded pagination for new lists. Include a unique secondary
  sort. For reports, fetch the complete required dataset; do not silently truncate
  totals to one page. Preserve established large-data/count strategies.
- Return persisted rows from create/update and require an affected row for single
  record deletes, usually with returning select + single. Zero affected rows must
  not be reported as successful CRUD. Document separately any intentionally
  idempotent bulk synchronization contract.
- Use maybeSingle/null for an unavailable detail without exposing another user's
  record. Absence and authorization are not equivalent; establish valid scope first.
- Show sanitized errors to users. Retain safe diagnostic codes through existing
  error handling; do not expose backend messages or sensitive row contents.

## Example: owner-scoped table and permissions

This example models personal items: signed-in users manage only their own rows.
Signed-out clients receive no access. Use membership/role policies instead when
the product requires shared tenant or organization access. Inspect existing grants
and policies when adapting this pattern to an existing table.

```sql
-- Example incremental migration for a new table in a disposable database.
begin;

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  created_at timestamptz not null default now()
);

create index items_user_created_idx
  on public.items (user_id, created_at desc, id desc);

alter table public.items enable row level security;

revoke all on public.items from public, anon, authenticated;
grant select, delete on public.items to authenticated;
grant insert (user_id, name) on public.items to authenticated;
grant update (name) on public.items to authenticated;

create policy items_select_own
  on public.items for select to authenticated
  using (user_id = (select auth.uid()));

create policy items_insert_own
  on public.items for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy items_update_own
  on public.items for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy items_delete_own
  on public.items for delete to authenticated
  using (user_id = (select auth.uid()));

commit;
```

RLS compares the requested owner to the authenticated session, so supplying another
user's ID cannot grant access. Column grants allow changing only `name`; clients
cannot rewrite ownership, IDs, or creation timestamps. Database constraints also
apply to requests that bypass the form. These controls combine
[row policies](https://supabase.com/docs/guides/database/postgres/row-level-security)
and [column privileges](https://supabase.com/docs/guides/database/postgres/column-level-security).

The foreign key deliberately does not cascade account deletion. Choose retention,
cleanup, or cascading behavior according to the product's actual data lifecycle.

## Example: generate types from the migrated schema

After applying the intended migrations to a running disposable local Supabase
instance, generate types with the installed CLI. This illustrative command assumes
the destination directory exists; use the project's configured script/path if it
has one. Do not run migrations merely to copy a documentation example.

```sh
supabase gen types typescript --local --schema public > src/lib/supabase/database.types.ts
```

The examples below expect this real generated `Database` export, including the
`items` table above. The generated file is a prerequisite, not a handwritten stub.

## Example: validation and domain types

```ts
// src/features/items/types/index.ts
import type { Database } from '@/lib/supabase/database.types';
import { z } from 'zod';

export const itemSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Use 120 characters or fewer'),
});

export type ItemValues = z.infer<typeof itemSchema>;
export type Item = Pick<Database['public']['Tables']['items']['Row'], 'id' | 'name'>;
export type ItemScope = { userId: string };
export type ItemListParams = { page: number; pageSize: number; search: string };
export type ItemPage = { items: Item[]; total: number };
```

The schema validates editable input. Domain rows derive from the generated database
contract, and the service selects only the columns it returns. Keep form input and
parsed output types separate if a schema transforms their TypeScript types.

## Example: injected browser service

```ts
// src/features/items/services/api.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { z } from 'zod';
import {
  itemSchema,
  type Item,
  type ItemListParams,
  type ItemPage,
  type ItemScope,
  type ItemValues,
} from '../types';

const idSchema = z.string().uuid();
const scopeSchema = z.object({ userId: idSchema });
const listSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  search: z.string().trim().max(120),
});
const columns = 'id, name' as const;

export class ItemRequestError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
    this.name = 'ItemRequestError';
  }
}

function throwRequestError(error: { code: string }): never {
  throw new ItemRequestError('The item request could not be completed. Please retry.', error.code);
}

function requireRow<T>(data: T | null): T {
  if (data === null) {
    throw new ItemRequestError('The requested change could not be confirmed.', 'INVALID_RESULT');
  }
  return data;
}

export function createItemService(client: SupabaseClient<Database>) {
  return {
    async list(scope: ItemScope, params: ItemListParams, signal: AbortSignal): Promise<ItemPage> {
      const { userId } = scopeSchema.parse(scope);
      const { page, pageSize, search } = listSchema.parse(params);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to)) {
        throw new ItemRequestError('The requested page is invalid.', 'INVALID_INPUT');
      }

      let request = client.from('items').select(columns, { count: 'exact' }).eq('user_id', userId);
      if (search) request = request.ilike('name', `%${search}%`);

      const { data, error, count } = await request
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to)
        .abortSignal(signal);

      if (error) throwRequestError(error);
      if (data === null || count === null) {
        throw new ItemRequestError('The item list was incomplete.', 'INVALID_RESULT');
      }
      const expectedRows = Math.min(pageSize, Math.max(0, count - from));
      if (data.length !== expectedRows) {
        throw new ItemRequestError('The item page was incomplete.', 'INCOMPLETE_PAGE');
      }
      return { items: data, total: count };
    },

    async get(scope: ItemScope, id: string, signal: AbortSignal): Promise<Item | null> {
      const { userId } = scopeSchema.parse(scope);
      const itemId = idSchema.parse(id);
      const { data, error } = await client
        .from('items')
        .select(columns)
        .eq('user_id', userId)
        .eq('id', itemId)
        .abortSignal(signal)
        .maybeSingle();

      if (error) throwRequestError(error);
      return data;
    },

    async create(scope: ItemScope, values: ItemValues): Promise<Item> {
      const { userId } = scopeSchema.parse(scope);
      const payload = itemSchema.parse(values);
      const { data, error } = await client
        .from('items')
        .insert({ user_id: userId, name: payload.name })
        .select(columns)
        .single();

      if (error) throwRequestError(error);
      return requireRow(data);
    },

    async update(scope: ItemScope, id: string, values: ItemValues): Promise<Item> {
      const { userId } = scopeSchema.parse(scope);
      const itemId = idSchema.parse(id);
      const payload = itemSchema.parse(values);
      const { data, error } = await client
        .from('items')
        .update({ name: payload.name })
        .eq('user_id', userId)
        .eq('id', itemId)
        .select(columns)
        .single();

      if (error) throwRequestError(error);
      return requireRow(data);
    },

    async remove(scope: ItemScope, id: string): Promise<void> {
      const { userId } = scopeSchema.parse(scope);
      const itemId = idSchema.parse(id);
      const { data, error } = await client
        .from('items')
        .delete()
        .eq('user_id', userId)
        .eq('id', itemId)
        .select('id')
        .single();

      if (error) throwRequestError(error);
      requireRow(data);
    },
  };
}

export type ItemService = ReturnType<typeof createItemService>;
```

Create one stable service instance in the client composition layer with the existing
authenticated `SupabaseClient<Database>`, then inject it into client query/mutation
hooks. Do not create a second auth client or call this service during server rendering.
The client shell supplies the current identity, cancels reads on identity changes,
and prevents late results or stale submissions from crossing account boundaries.

This example uses one-based offset pagination and exact counts for small lists.
Its `search` supports ILIKE pattern matching, including wildcard characters; define
literal search escaping separately if the UI promises literal substring matching.
Do not use one page as a complete report. For large/changing datasets, use the
project's cursor and consistency strategy instead of silently truncating results.

The service's safe errors are for UI feedback; retain diagnostic codes through the
project's error mapper. Validation failures should map to field or safe form errors.
`maybeSingle()` returns null for an unavailable detail. Updates and deletes require
a returned row so zero affected rows cannot appear successful.

## Verification before adopting the pattern

Use two synthetic users and an unauthenticated client in a disposable database:

- A user can create, list, read, rename, and delete their own item.
- Another user cannot read, change, or delete that item, or insert under its owner's ID.
- Unauthenticated requests cannot access the table.
- Direct updates to `user_id`, `id`, and `created_at` fail; protected rows remain unchanged.
- Blank names, invalid owners, and invalid IDs fail at the appropriate boundary.
- Failed requests remain errors; unavailable details are null; zero-row writes fail.
- Lists apply scope/search, keep deterministic order, and reject truncated pages.
- Aborted reads and identity changes do not repopulate a previous user's UI/cache.

Use ordinary user clients for policy assertions; admin credentials are only for
fixture setup and inspection. Regenerate real types and typecheck service consumers.
Record executed checks and unrun cases. Documentation examples and mocked service
tests are not evidence that a database policy has been applied or verified.
