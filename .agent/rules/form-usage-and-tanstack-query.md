---
trigger: always_on
---

# Forms, queries, and mutations

See the supplied [query examples](../../docs/agent-examples/03-queries-and-mutations.md)
and [form examples](../../docs/agent-examples/04-forms-and-page-composition.md).
Adapt their imports and scope to the actual application.

## Queries and cache

Put pure data access in feature services, cache keys in `services/query-keys.ts`,
read hooks in `services/queries.ts`, and write hooks in `services/mutations.ts`.
Use the installed TanStack Query v5 API and mount its provider before consumers.
The current Query provider and budget/habit hooks are not wired into the app;
adding a hook alone does not migrate an existing Zustand screen.

Include authenticated user identity, actual ownership scope when available, record
IDs, pagination, and every applied filter in cache keys. Centralize key factories.
Enable reads only when required identity/scope/ID is available. Do not mount an
edit form with an empty ID and leave it indefinitely pending.

Optional search/filter fields may be omitted. Required identity and validated page
parameters need not be optional. Normalize UI-only ALL values before backend
requests. Apply every supported filter in both the request and its cache key.

Choose retries deliberately; do not retry non-idempotent writes automatically.
Use mutation variables to capture the submitted scope and ID. Completion must
update that scope's cache even if the user changes screens meanwhile. Update detail
cache from saved rows (null after delete) and await relevant invalidation in
onSuccess. Do not unconditionally invalidate on failure. Distinguish a completed
write from a failed refresh so users do not repeat a committed operation.

Clear sensitive caches and cancel pending reads on identity changes/logout through
the existing auth lifecycle. Remount scoped forms and prevent stale submissions.
Account for persisted Zustand state and in-flight writes when migrating a flow;
clearing Query alone is insufficient.

## Shared form and wrappers

Create and edit use one shared field layout receiving form, mode, and onSubmit.
The shared form handles presentation; wrappers own defaults, validation, mutation
calls, notifications, navigation, and reset behavior. Services and mutation hooks
must not display toasts. Produce one success notification in the wrapper.

Use React Hook Form with Zod and installed shadcn Form primitives. Distinguish Zod
input/output types for transforming schemas. Check Button props; the installed
Button supports disabled and visible pending content, not a custom loading prop.

- Label inputs, associate validation messages, and expose pending/error states.
- Disable inputs and submit controls during submission; await mutateAsync.
- Catch rejected submissions, retain entered values, and show a sanitized root or
  field error without an unhandled rejection.
- On successful create, clear defaults as appropriate; on successful edit, reset
  the dirty baseline to persisted values.
- Never reset on every background query update; preserve unsaved edits.
- Key wrappers by identity, ownership scope, and record ID after applying the
  existing unsaved-changes policy in `src/features/settings/use-unsaved-changes.ts`.
- Distinguish initial loading, initial error/retry, unavailable record, and failed
  background refresh while retaining the current form.

## Tables and deletion

Read the actual DataTable and usePagination contracts; pageIndex is one-based.
Keep pagination/search/filter state in nuqs and reset/clamp pages after changes.
Only delete from ConfirmationDialog's confirmed action. Keep it open with an error
on failure, disable repeat confirmation while pending, and close after success.
Cancellation sends no write. Handle the last row of the final page without leaving
an inaccessible empty page.
