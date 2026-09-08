---
trigger: always_on
---

# Acceptance and verification

Adapt [the supplied acceptance scenarios](../../docs/agent-examples/05-acceptance-scenarios.md)
to the feature being changed. They are requirements, not evidence of tests run.

## Database changes

Use synthetic fixtures in a disposable database with ordinary user/anonymous
clients. Admin access is for setup/inspection, not the policy assertions. Cover
allowed CRUD, cross-owner denial, anonymous/non-member denial, protected column
changes, constraints bypassing forms, and loss of access after membership removal
where the real model supports membership. Verify unchanged protected rows even
when a denied write returns zero rows instead of an authorization error.

Regenerate actual database types and typecheck consumers after schema changes.
Record database environment, commands, results, and any unrun cases. Review legacy
clients/jobs and data backfills before deployment. Never claim mocked service tests
prove RLS enforcement or that checked-in policies match a live deployment.

## Services and UI

Test behavior relevant to the change: rejection on failed/incomplete reads or
writes, missing detail, input validation before requests, bounded deterministic
lists, returned persisted writes, zero-row delete failure, cache isolation, scope
changes during mutations, and cache clearing on logout.

For form changes verify shared fields, validation, pending controls, retained input
on rejection, correct success/reset behavior, background refresh preserving dirty
values, and scope remounting. Check loading/error/retry/unavailable states and delete
cancel/confirm/failure/page-boundary behavior. Verify labels and keyboard access.

## Repository commands

- `pnpm exec tsc --noEmit --incremental false`
- `pnpm exec eslint <changed source and test files>`
- `pnpm test:settings` for existing save-queue, backup, and budget sync coverage.
- Run additional focused regression tests for changed data behavior.
- `pnpm build` when route/client/server integration changes require a production build.

Use the existing Node test loader in `tests/register-typescript.mjs`; do not install
a new runner just for a small regression. Report pre-existing failures separately
from changes. Do not claim full compliance based only on a successful typecheck.
