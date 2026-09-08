# Example 1: Database and Permissions

This migration is for a new disposable example database. Do not apply it to an existing project without adapting it to that project's real schema, membership model, and migration history.

The permission model is intentionally explicit: members may manage employees within their tenant, and clients cannot grant themselves membership or move an employee between tenants.

## Migration

```sql
begin;

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120)
);

create table public.tenant_members (
  tenant_id uuid not null references public.tenants(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (tenant_id, user_id)
);

create index tenant_members_user_idx
  on public.tenant_members (user_id, tenant_id);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  created_at timestamptz not null default now()
);

create index employees_tenant_created_idx
  on public.employees (tenant_id, created_at desc, id desc);

alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;
alter table public.employees enable row level security;

revoke all on public.tenants from public, anon, authenticated;
revoke all on public.tenant_members from public, anon, authenticated;
revoke all on public.employees from public, anon, authenticated;

grant select on public.tenants to authenticated;
grant select on public.tenant_members to authenticated;
grant select, delete on public.employees to authenticated;
grant insert (tenant_id, name) on public.employees to authenticated;
grant update (name) on public.employees to authenticated;

create policy tenant_members_read_self
  on public.tenant_members for select to authenticated
  using (user_id = (select auth.uid()));

create policy tenants_read_member
  on public.tenants for select to authenticated
  using (
    exists (
      select 1 from public.tenant_members m
      where m.tenant_id = tenants.id
        and m.user_id = (select auth.uid())
    )
  );

create policy employees_read_member
  on public.employees for select to authenticated
  using (
    exists (
      select 1 from public.tenant_members m
      where m.tenant_id = employees.tenant_id
        and m.user_id = (select auth.uid())
    )
  );

create policy employees_insert_member
  on public.employees for insert to authenticated
  with check (
    exists (
      select 1 from public.tenant_members m
      where m.tenant_id = employees.tenant_id
        and m.user_id = (select auth.uid())
    )
  );

create policy employees_update_member
  on public.employees for update to authenticated
  using (
    exists (
      select 1 from public.tenant_members m
      where m.tenant_id = employees.tenant_id
        and m.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.tenant_members m
      where m.tenant_id = employees.tenant_id
        and m.user_id = (select auth.uid())
    )
  );

create policy employees_delete_member
  on public.employees for delete to authenticated
  using (
    exists (
      select 1 from public.tenant_members m
      where m.tenant_id = employees.tenant_id
        and m.user_id = (select auth.uid())
    )
  );

commit;
```

## Why this design

- The membership policy reads the caller's own membership rows without querying itself recursively.
- Browser roles receive no membership write privileges.
- Column-level update privileges allow only `name` changes, so even a user who belongs to two tenants cannot move a record by changing `tenant_id`.
- Employee reads and writes still need the matching RLS policy. A tenant ID in a request is not sufficient.
- Foreign keys and name constraints enforce integrity when requests bypass the form.

Provision synthetic users, tenants, and memberships through the local test fixture/admin setup. Never expose that provisioning operation as an unrestricted browser action. Adapt grants separately if a trusted provisioning service needs them.

After applying this migration locally, generate database types through the repository's configured command and export `Database` from its designated package. Do not write a fake generated `Database` type to silence compilation errors.

Verify all allow/deny cases in [Acceptance scenarios](05-acceptance-scenarios.md) before adopting the model.

Reference: [Supabase RLS and grants](https://supabase.com/docs/guides/database/postgres/row-level-security).
