# Rules adoption — 2026-09-07

## Installed guidance

[AGENTS.md](../AGENTS.md) is the repository entry point. The `.agent/rules/` files
adapt the supplied principles to this app; all six original documents are retained
unchanged in [agent-examples](agent-examples/README.md).

The earlier guidance incorrectly prescribed Axios/js-cookie auth, latest package
versions, nonexistent merchant utilities, hook-level toasts, and onSettled-only
invalidation. It also showed unsupported Button loading props and unhandled form
submissions. The updated rules describe actual integration points and require
wrapper-owned feedback, captured mutation scope, explicit failures, and verified
component contracts. The prior redundant kickoff approval is removed for already
authorized work.

## Concrete corrections

- Budget synchronization refuses an incomplete multi-table snapshot, retaining the
  last local state if any table fails. Its existing null failure contract is kept
  for background sync consumers; the Query-facing API converts it to rejection.
- Budget API create/save operations reject missing returned data and use safe
  messages. Single-record API deletes require a returned row and reject zero-row
  results; salary delete also validates its text ID before issuing a request.
- Habit API reads reject failed fetches instead of returning an empty list; detail
  absence returns null. Failed boolean save/delete results now reject at the API
  boundary. Low-level habit delete requests one returned ID and exposes a boolean
  result, preserving the legacy nonthrowing store integration.
- Habit API applies its declared habitKind filter, treating older records without
  a kind as build habits.
- Regression coverage lives in `tests/data-access.test.mjs`, using the existing
  Node loader and mocked network boundary. Run with `pnpm test:data-access`.

## Cross-repository refactor — 2026-09-08

The user requested applying the rules across the project and explicitly chose to
keep the current database model. No schema, ownership backfill, grants, policies,
or hosted database data were changed. Existing workspace edits and all supplied
reference documents were preserved.

### Implemented

- Added shared sanitized request errors and complete-list fetching in bounded
  500-row requests. Exact counts reject missing results, premature empty pages,
  or changing totals; offsets advance by the actual returned row count even when
  the server cap is smaller. This does not provide transaction isolation across
  pages or tables.
- Budget, habit, mood, gym, media, and wellbeing report/sync reads now select
  explicit columns and use deterministic complete fetching. Legacy habit, media,
  and budget adapters preserve their documented null failure sentinel. Mood and
  gym readers throw instead of silently clearing their stores after failure.
- Habit saves return mapped persisted rows. Failed optimistic create/edit rolls
  back; delete retains the record until persistence succeeds. Refreshes cannot
  replace in-flight CRUD edits. Monthly repeat days through 31 are accepted.
- Removed the habit save fallback that dropped unsupported newer fields. A schema
  missing checked-in habit columns now fails visibly instead of silently losing
  habit direction, snooze, or ordering information.
- Habit create/edit share a typed field layout, extracted schedule/reminder
  sections, pending fieldset, inline submission errors, draft navigation guards,
  saved-value reset, and wrapper-owned success feedback. Edit distinguishes
  initial loading, failed load/retry, unavailable records, and background errors.
  Submission guards reject stale sessions and suppress completion feedback or
  navigation after the wrapper has unmounted.
- Media saves/updates use returned rows; upload failures cannot return fabricated
  public URLs. Stores commit only after confirmed persistence. Voice/gallery
  previews survive failure and their save actions prevent repeated submission.
- Habit/media/account deletion uses the shared confirmation dialog. The shared
  dialog accepts caller-owned errors and prevents dismissal while pending.
  Body metric deletion requires a returned ID, and its history dialog retains
  failures with pending controls. Body metric save failures retain form inputs.
- Mounted a Query provider inside the authenticated boundary, keyed by identity.
  Unmount cancels and clears its client. Budget/habit hooks have centralized
  identity-aware keys, explicit retries, submitted identity in mutation variables,
  success-only awaited invalidation, and no hook-level toasts. The existing
  Zustand screens still own their writes; unused hooks were not wired as a
  competing synchronization path.
- User-owned wellbeing and focus stores use separate persisted keys per identity.
  Memory resets without overwriting stored drafts; legacy unassigned keys are
  preserved and are never automatically uploaded into a newly signed-in account.
  Stale wellbeing refresh results are ignored after identity changes.
- Wellbeing app-limit/settings/bedtime writes validate allowlisted editable fields,
  discard protected/unknown input fields, and require returned results. Single
  app-limit deletes and focus/challenge status updates reject zero-row outcomes.
- Moved mood/media domain schemas out of stores while retaining public exports.
  Budget retry/maintenance errors are sanitized; their intentionally idempotent
  bulk synchronization contract is documented separately from single-record CRUD.
- Shared pagination bounds page/page size, clears stale cursors after changes,
  clamps pages after deletion, and labels table navigation buttons.

### Remaining adoption work

This is a broad integration pass, not evidence that every legacy component and
service now meets every rule. In particular:

| Area | Remaining work |
| --- | --- |
| Database | Ownership/RLS changes are excluded by the user's decision. Real generated Database types still require a configured disposable migrated database; no handwritten replacement was fabricated. |
| Zustand/Query migration | Budget, gym, habits, media, and settings retain established store write paths. Fully migrating these flows and their retry/realtime consumers is still separate work; mounting the provider alone does not complete it. |
| Legacy shared state | Budget/media/profile and gym records remain shared by the existing model. This refactor does not turn local identity cache keys into database authorization. |
| Background writes | Legacy gym plan/log/custom-exercise and habit completion/unit/reordering adapters still need full persistence/error/retry integration with their consumers. Push/admin job services also need a separate complete-data and service-contract pass. |
| Forms and layout | The extracted habit form and media card are below 300 lines. Other oversized legacy pages, custom dialogs, fields, layout/color tokens, and accessibility details remain to be migrated. |
| Wellbeing writes | Focus creation plus app association remains a multi-request operation. Database transactions, write concurrency, and the entire focus timer's optimistic failure UX are not established by these changes. |
| Browser acceptance | Keyboard interaction, actual modal failure behavior, dirty form refresh, and account-switch races still need authenticated browser verification. |

### Verification

- `pnpm test:data-access`: 17 regression tests passed, including persisted habit
  values, failed CRUD rollback, complete reads under server caps, sanitized
  failures, identity partitions, query keys, and protected write-field filtering.
- `pnpm test:settings`: 8 existing save-queue/backup/budget-sync tests passed.
- `pnpm exec tsc --noEmit --incremental false`: passed.
- ESLint over all changed/new source and test files: passed without warnings.
- `pnpm build`: passed after the sandbox's Google Fonts DNS failure was retried
  with approved network access. The build reported existing metadataBase and JSON
  named-export warnings; the named-export import was subsequently corrected.
- `git diff --check`: passed.

The tests mock the network boundary and do not verify RLS or hosted database
state. No authenticated browser tests or disposable-database policy tests ran.
The existing Node MODULE_TYPELESS_PACKAGE_JSON warning remains.
