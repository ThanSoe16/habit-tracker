import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = new URL('../', import.meta.url);
export function buildOwnerBackfill(userId, backupSchema = 'account_backup_20260912') {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    throw new Error('A verified Auth user UUID is required.');
  }
  if (!/^account_backup_[a-z0-9_]+$/.test(backupSchema)) throw new Error('Invalid backup schema.');
  const migrations = [
    '20260912000000_account_ownership.sql',
    '20260912000001_account_workout_exercises.sql',
  ]
    .map(
      (name) =>
        `-- BEGIN ${name}\n${readFileSync(new URL(`migrations/${name}`, root), 'utf8')}\n-- END ${name}`,
    )
    .join('\n\n');
  return `-- Generated owner-specific rollout; run the WHOLE file in Supabase SQL Editor.
-- Verified owner: ${userId}. This script applies the account migrations.
-- Private database row backups are retained in ${backupSchema}.
-- One transaction: any failed check rolls everything back. No records are deleted.
-- This is NOT a test-fixture script and must not be rerun after successful completion.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '120s';
SET LOCAL app.legacy_owner_id = '${userId}';
LOCK TABLE auth.users IN SHARE MODE;
DO $$ BEGIN
  IF (SELECT count(*) FROM auth.users) <> 1 OR NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = '${userId}'::uuid
  ) THEN
    RAISE EXCEPTION 'Account audit changed. Expected only the explicitly verified owner; stop and review.';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'user_id') THEN
    RAISE EXCEPTION 'Ownership migration already present. Stop and review instead of rerunning.';
  END IF;
END $$;
CREATE SCHEMA ${backupSchema};
REVOKE ALL ON SCHEMA ${backupSchema} FROM PUBLIC, anon, authenticated;
CREATE TABLE ${backupSchema}._record_counts (table_name TEXT PRIMARY KEY, rows_before BIGINT, rows_after BIGINT);
CREATE TABLE ${backupSchema}._schema_metadata (kind TEXT, definition JSONB);
REVOKE ALL ON ALL TABLES IN SCHEMA ${backupSchema} FROM PUBLIC, anon, authenticated;
DO $$ DECLARE source_table RECORD; n BIGINT; foreign_owners BIGINT;
BEGIN
  -- Freeze writes while capturing and checking the existing values.
  FOR source_table IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename LOOP
    EXECUTE format('LOCK TABLE public.%I IN ACCESS EXCLUSIVE MODE', source_table.tablename);
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public'
      AND table_name = source_table.tablename AND column_name = 'user_id') THEN
      EXECUTE format('SELECT count(*) FROM public.%I WHERE user_id IS NOT NULL AND user_id::text NOT IN (%L, %L)',
        source_table.tablename, '${userId}', 'default_user') INTO foreign_owners;
      IF foreign_owners <> 0 THEN RAISE EXCEPTION 'Unexpected owner in %. No data changed.', source_table.tablename; END IF;
    END IF;
    EXECUTE format('CREATE TABLE ${backupSchema}.%I AS TABLE public.%I', source_table.tablename, source_table.tablename);
    EXECUTE format('REVOKE ALL ON ${backupSchema}.%I FROM PUBLIC, anon, authenticated', source_table.tablename);
    EXECUTE format('ALTER TABLE ${backupSchema}.%I ENABLE ROW LEVEL SECURITY', source_table.tablename);
    EXECUTE format('SELECT count(*) FROM public.%I', source_table.tablename) INTO n;
    INSERT INTO ${backupSchema}._record_counts VALUES (source_table.tablename, n, NULL);
  END LOOP;
END $$;
LOCK TABLE storage.objects IN SHARE ROW EXCLUSIVE MODE;
CREATE TABLE ${backupSchema}._storage_objects AS TABLE storage.objects;
CREATE TABLE ${backupSchema}._storage_buckets AS TABLE storage.buckets;
REVOKE ALL ON ALL TABLES IN SCHEMA ${backupSchema} FROM PUBLIC, anon, authenticated;
INSERT INTO ${backupSchema}._schema_metadata
  SELECT 'column', to_jsonb(c) FROM information_schema.columns c WHERE table_schema IN ('public', 'storage');
INSERT INTO ${backupSchema}._schema_metadata
  SELECT 'policy', to_jsonb(p) FROM pg_policies p WHERE schemaname IN ('public', 'storage');
INSERT INTO ${backupSchema}._schema_metadata
  SELECT 'grant', to_jsonb(g) FROM information_schema.table_privileges g WHERE table_schema IN ('public', 'storage');
INSERT INTO ${backupSchema}._schema_metadata
  SELECT 'constraint', jsonb_build_object('table', conrelid::regclass::text, 'name', conname, 'sql', pg_get_constraintdef(oid))
  FROM pg_constraint WHERE connamespace = 'public'::regnamespace;
INSERT INTO ${backupSchema}._schema_metadata
  SELECT 'function', jsonb_build_object('name', p.oid::regprocedure::text, 'sql', pg_get_functiondef(p.oid))
  FROM pg_proc p WHERE p.pronamespace = 'public'::regnamespace AND p.prokind = 'f';

${migrations}

-- Verify every original value, including duplicate rows, before committing.
DO $$ DECLARE source_table RECORD; different BOOLEAN; n BIGINT; foreign_owners BIGINT;
BEGIN
  FOR source_table IN SELECT table_name, rows_before FROM ${backupSchema}._record_counts LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', source_table.table_name) INTO n;
    IF n <> source_table.rows_before THEN RAISE EXCEPTION 'Row count changed in %', source_table.table_name; END IF;
    EXECUTE format(
      'SELECT EXISTS ((SELECT to_jsonb(t) - ''user_id'' FROM ${backupSchema}.%I t EXCEPT ALL SELECT to_jsonb(t) - ''user_id'' FROM public.%I t) UNION ALL (SELECT to_jsonb(t) - ''user_id'' FROM public.%I t EXCEPT ALL SELECT to_jsonb(t) - ''user_id'' FROM ${backupSchema}.%I t))',
      source_table.table_name, source_table.table_name, source_table.table_name, source_table.table_name
    ) INTO different;
    IF different THEN RAISE EXCEPTION 'Original values changed in %. Rolling back.', source_table.table_name; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public'
      AND table_name = source_table.table_name AND column_name = 'user_id') THEN
      EXECUTE format('SELECT count(*) FROM public.%I WHERE user_id::text IS DISTINCT FROM %L',
        source_table.table_name, '${userId}') INTO foreign_owners;
      IF foreign_owners <> 0 THEN RAISE EXCEPTION 'Owner verification failed in %', source_table.table_name; END IF;
    END IF;
    UPDATE ${backupSchema}._record_counts SET rows_after = n WHERE table_name = source_table.table_name;
  END LOOP;
  IF EXISTS (
    (SELECT to_jsonb(t) - 'owner_id' - 'updated_at' FROM ${backupSchema}._storage_objects t
      EXCEPT ALL SELECT to_jsonb(t) - 'owner_id' - 'updated_at' FROM storage.objects t)
    UNION ALL
    (SELECT to_jsonb(t) - 'owner_id' - 'updated_at' FROM storage.objects t
      EXCEPT ALL SELECT to_jsonb(t) - 'owner_id' - 'updated_at' FROM ${backupSchema}._storage_objects t)
  ) THEN RAISE EXCEPTION 'Storage metadata changed unexpectedly. Rolling back.'; END IF;
END $$;
NOTIFY pgrst, 'reload schema';
COMMIT;
SELECT table_name, rows_before, rows_after FROM ${backupSchema}._record_counts ORDER BY table_name;
`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [userId, output] = process.argv.slice(2);
  if (!output)
    throw new Error(
      'Usage: node supabase/operations/build-owner-backfill.mjs OWNER_UUID OUTPUT.sql',
    );
  writeFileSync(output, buildOwnerBackfill(userId));
}
