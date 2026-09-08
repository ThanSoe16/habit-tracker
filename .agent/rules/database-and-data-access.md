---
trigger: always_on
---

# Database and data access

Adapt [database](../../docs/agent-examples/01-database-and-permissions.md) and
[service](../../docs/agent-examples/02-types-and-data-access.md) examples to the
actual schema. Never apply the disposable employee migration to this database.

## Authorization and integrity

The repository has a mixed schema: legacy budget/habit tables have public policies
and shared keys, while newer wellbeing tables have user ownership policies.
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

## Types and services

Generate Database types from the actual migrated database before introducing a
`SupabaseClient<Database>` contract. There is currently no repository-wide generated
Database export or configured generation script. Do not fabricate one, hand-edit
generated output, or label handwritten Zod/domain types as generated. Record this
gap when a task cannot access the configured disposable database.

For new services, inject the approved typed client and keep React, cookies, toasts,
and navigation outside data access. When adapting legacy service contracts, update
all consumers and verify error handling, including background synchronization.

- Validate IDs, filters, pagination bounds, and write payloads before requests.
  Match real ID types: legacy budget and habit IDs are text, not universally UUIDs.
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
