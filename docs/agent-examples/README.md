# Example Coding Design: Employee Feature

Use this reference to understand how the rules fit together. These are Markdown code examples, not an installed or tested application. Adapt imports, package exports, schemas, providers, and UI component contracts to the real repository before adopting them.

## Read in order

1. [Database and permissions](01-database-and-permissions.md)
2. [Types and data access](02-types-and-data-access.md)
3. [Queries and mutations](03-queries-and-mutations.md)
4. [Shared form and create/edit wrappers](04-forms-and-page-composition.md)
5. [Acceptance scenarios](05-acceptance-scenarios.md)

## Reference assumptions

- Next.js App Router, React Hook Form, Zod, TanStack Query v5, Supabase JS v2, and existing Shadcn/Radix components. Check installed versions before using the code.
- A fictional `tenants` / `tenant_members` / `employees` model. This does not describe your current database.
- In this example, every tenant member may create, read, edit, and delete employees belonging to that tenant. Membership provisioning is a separate trusted administrative operation.
- If your product has owner/admin/viewer roles, implement its actual role checks before adapting these policies.
- The browser uses a normal user-session Supabase client. RLS enforces access. A tenant filter selects results; it does not grant permission.
- `@repo/database` is an illustrative type-only package export. `@/lib/supabase/client` is an integration point for your existing browser client factory, not an instruction to create a competing auth flow.
- English UI strings are examples. Use your existing localization system when integrating.

## Responsibilities

```text
Route and authenticated application shell
  -> resolves current identity and selected tenant
  -> mounts feature UI with a scope key

Create/Edit form wrapper
  -> validates form values
  -> calls mutation hook
  -> presents feedback

Query/Mutation hooks
  -> own cache keys and refresh behavior
  -> call pure employee service

Employee service
  -> maps verified inputs to Supabase operations
  -> returns typed data or throws an error

Supabase database
  -> applies grants, RLS, and integrity constraints
```

## Illustrative placement

```text
supabase/migrations/<timestamp>_employee_example.sql
packages/database/src/database.types.ts        # Generated, never handwritten
apps/dashboard/src/features/employees/
  types/index.ts
  services/api.ts
  services/query-keys.ts
  services/queries.ts
  services/mutations.ts
apps/dashboard/src/components/pages/employees/
  _components/employee-form.tsx
  create/_components/create-employee-form.tsx
  edit/_components/edit-employee-form.tsx
  edit/index.tsx
```

Keep app-specific hooks and toasts in the app. Share generated database contracts through the owning package. Extract the employee service into a shared package only if multiple consumers need it.

## Integration boundaries

Before using these snippets, provide the existing QueryClient provider, authenticated scope, typed browser client factory, and installed form primitives. Parent code must remount scoped UI on identity/tenant changes and clear sensitive cached data at logout. Do not render the examples before identity and tenant selection are available.

This reference covers CRUD services and create/edit UI. It deliberately leaves table/filter wiring and the delete dialog to your existing components, whose actual props were not supplied. The acceptance guide explains the required connections.

Client validation improves feedback. Database constraints and authorization remain responsible for enforcing the rules against direct requests. This sample also uses last-write-wins editing; add a version check if your workflow requires conflict detection.
