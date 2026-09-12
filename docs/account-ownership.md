# Account ownership and rollout

The app now supports separate personal accounts, including email registration and the
existing Google/GitHub sign-in options. It does not implement shared household/team
workspaces. Personal tables use `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`,
with defaults from `auth.uid()` and owner-only database policies. Natural keys include
`user_id`, so accounts can independently use the same date, currency, day, unit, or
budget backup record ID.

Digital wellbeing already has ownership. Focus-session app rows inherit it through
their parent and the challenge catalog is shared read-only reference data. Push
subscription/delivery tables have owner foreign keys but remain server-only. Reminder
relations enforce matching owners even for server writes.

## Verified owner backfill

The current project's only Auth account was verified read-only on 2026-09-12:
`thansoeoo020@gmail.com` / `f4b7da9e-8a5a-4ee3-9abb-526a26a8d464`.
For this project, run the normal migration command:

```sh
supabase db push --linked
```

Both account migrations recognize that exact UUID only while it remains the sole Auth
account. Other installations still need an explicit `app.legacy_owner_id`. A separate
SQL Editor session setting is not carried into `db push`.

The main migration retains private public-table and storage-metadata row copies in
`account_ownership_backup_20260912`, with before/after counts in `_record_counts`.
It verifies every original public value except the intentionally changed `user_id`
before its ownership statement completes. The supplemental migration also snapshots
and verifies exercise values. A failed value check rolls back that statement; neither
migration overwrites a pre-existing backup. These are database row copies, not copies
of stored file bytes.

[The prepared SQL script](../supabase/operations/assign-existing-data-to-current-user.sql)
is an alternative for SQL Editor. It supplies the same UUID, wraps both migrations in
one transaction, and adds a separate `account_backup_20260912` backup and final audit.
Use one rollout method. Do not run files under `supabase/tests` against the real
project; they contain synthetic fixtures.

The live audit found 37 rows in the previously undocumented `workout_exercises` table.
Migration `20260912000001` now preserves and scopes that table too. All existing
non-legacy owner IDs found in personal tables matched the verified account.
The script refuses to run if another Auth account has appeared since that audit,
if the first ownership migration is already present, or if a foreign owner is found.
It never overwrites an existing backup schema.

The failed `db push` did not add ownership columns to the checked hosted tables:
a subsequent read-only check still found 9 habits, 86 expenses, and 37 exercises,
with `user_id` absent in each. The account UUID was reverified at the same time.
The corrected migrations have not been applied by the agent: its CLI environment
has no management access token, independently of the user's authenticated terminal.
Rerun `supabase db push --linked` in that terminal. After an alternative manual SQL
Editor run, record both `20260912000000` and `20260912000001` as applied in migration
tooling instead of replaying them.

Disposable PostgreSQL tests cover normal migrations without any owner setting, each
on a separate connection, as well as the alternative prepared script. Injected balance
and exercise edits fail verification and roll back. Tests also verify refusal after a
second account appears, private backup access, storage ownership, preserved original
values/counts, and exercise-name isolation between accounts.

Regenerate the prepared script after any change to either migration:

```sh
node supabase/operations/build-owner-backfill.mjs \
  f4b7da9e-8a5a-4ee3-9abb-526a26a8d464 \
  supabase/operations/assign-existing-data-to-current-user.sql
```

## Preserve existing data before rollout

Do not deploy the new client against the old schema. Schedule a maintenance window,
stop the reminder worker and old clients, and take a database/storage backup first.
No hosted database was changed during implementation.

1. Inspect the actual hosted schema/policies against the migration history. Reconcile
   any schema drift, unknown tables, jobs, or storage buckets before sharing the app.
   The verified `workout_exercises` table is handled by migration `20260912000001`;
   installations without that legacy table are unchanged by this supplemental migration.
2. Identify the existing owner's **Auth user UUID** in Supabase Authentication.
   Review the legacy `default_user` profile, all ownerless rows, and unowned files.
   The migration assigns those shared records to the explicitly selected owner;
   it never chooses the first signed-in user. Existing valid owner IDs are retained.
   Invalid legacy owner IDs cause failure and require explicit reconciliation.
3. For this verified project, use `supabase db push --linked` as above. For other
   installations, apply outstanding migrations preceding `20260912000000` first,
   then run both account migrations in the same transaction as the owner setting:

   ```sql
   BEGIN;
   SET LOCAL app.legacy_owner_id = 'REPLACE_WITH_EXISTING_AUTH_USER_UUID';
   -- Paste the complete contents of:
   -- supabase/migrations/20260912000000_account_ownership.sql
   -- supabase/migrations/20260912000001_account_workout_exercises.sql
   COMMIT;
   ```

   With psql, use `\i` for both migration files between the setting and commit. The UUID placeholder must be replaced before
   execution. A missing/invalid owner fails rather than guessing or deleting data.
   Record versions `20260912000000` and `20260912000001` as applied in your migration tooling after a
   manual SQL-editor deployment, so it is not attempted again. This is a one-time
   incremental migration, not a rerunnable setup script.
4. For a brand-new database, historical migrations insert demo budget rows. Apply
   the earlier chain first and provision an explicit owner before this migration;
   review those demo rows with that owner. This migration does not silently discard
   them. New people registering after rollout start with empty budgets.
5. Deploy the matching app and worker. Enable desired signup/providers in Supabase
   Auth, configure the site's URL and `/auth/callback` redirect allowlist, and verify
   email delivery. No Supabase Auth provider settings were changed by this task.
6. Verify with two test accounts through the hosted ordinary-user APIs: registration,
   confirmation, login, CRUD, file upload/playback, reminders, logout, and switching
   accounts on the same browser. Update/install the new service worker before sharing.

`supabase/schema.sql` is now a pointer to the migration history. Its former public-policy
snapshot must never be reapplied to an account-isolated database.

## Browser and storage behavior

Budget/media/wellbeing snapshots use account-specific local-storage keys. The old
unassigned keys are retained but never automatically imported into any account. Export
unsynced legacy data before rollout and restore it only while signed in as its verified
owner. Profile/habit/mood/workout memory resets on identity change. Pending save/retry
queues are discarded on an identity change, and late responses cannot populate another
account. Retry behavior within the same session is preserved. Finish saving before
signing out; persisted account snapshots are not a durable database write queue.

Service operations capture the submitting session's token. RLS, not browser filters or
cache keys, enforces authorization. The Query provider already remounts per identity.

`media_store` and `workout-images` become private. Legacy unowned object metadata is
assigned to the selected owner without moving/deleting objects. New custom workout
uploads use the account's media folder; built-in exercise illustrations remain local
public assets. Durable object URLs stay in database rows; signed URLs are resolved for
display and refreshed every 30 minutes (one-hour validity). Previously published public
URLs stop working. Files already downloaded outside the app cannot be recalled.
The service worker stops caching Supabase requests and removes historical API/media
cache entries on activation. Notifications carry their owner ID; the worker displays
them only for the browser’s active account and closes other-account notifications.

## Verification performed

- Full historical migration chain plus the new migration on disposable PostgreSQL 14.19.
- Missing-owner refusal; explicit backfill; CRUD and cross-owner/anonymous denial across
  18 tables, including ownership tampering and verification that denied writes leave
  protected rows unchanged; duplicate natural keys across accounts; database constraints.
- Storage owner/folder checks and anonymous/cross-owner denial, legacy object access,
  push foreign-key isolation, signup profile provisioning, cascade deletion, restricted
  provisioning function execution. SQL assertions use `authenticated`/`anon` roles;
  administrative access is limited to fixture setup and integrity inspection.
- TypeScript, changed-file ESLint, production build, settings/data-access regressions,
  and account-switch/queue regressions. Build reports existing metadataBase,
  module-registration deprecation, and Node localStorage warnings.

The database harness supplies minimal Supabase auth/storage schemas and JWT identity
settings; it does not test the actual hosted Auth, PostgREST, Storage, or Realtime APIs.
Live email/provider signup, device push delivery, and authenticated browser switching
remain rollout checks. Browser visual QA was unavailable because the computer-use
runtime reported no available browser.

Actual Database type generation was attempted with `supabase gen types typescript
--db-url ...`. The CLI requires Docker for its inspector and Docker is not running.
No generated types were fabricated and no `SupabaseClient<Database>` contract was
introduced. Generate them from the migrated Supabase database when Docker is available
before adopting the repository-wide typed-client contract.

To repeat policy tests, create an **empty disposable local database** named
`habit_account_*`, then run:

```sh
ACCOUNT_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/habit_account_test \
  node tests/run-account-database-tests.mjs
# Use a separate empty database for each of these backfill runs:
ACCOUNT_TEST_DB_PUSH=1 ACCOUNT_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/habit_account_push \
  node tests/run-owner-backfill-tests.mjs
ACCOUNT_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/habit_account_operator \
  node tests/run-owner-backfill-tests.mjs
pnpm exec tsc --noEmit --incremental false
pnpm test:settings
pnpm test:data-access
node --import ./tests/register-typescript.mjs --test tests/account-isolation.test.mjs
pnpm build
```

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).
