-- The hosted project also contains this legacy table (not created by the old migrations).
-- Leave installations without it unchanged; preserve every existing exercise value.
DO $$
DECLARE
  owner_id UUID := nullif(current_setting('app.legacy_owner_id', true), '')::uuid;
  item RECORD;
  different BOOLEAN;
BEGIN
  IF to_regclass('public.workout_exercises') IS NULL THEN RETURN; END IF;
  LOCK TABLE auth.users IN SHARE MODE;
  IF owner_id IS NULL AND (SELECT count(*) FROM auth.users) = 1 AND EXISTS (
    SELECT 1 FROM auth.users WHERE id = 'f4b7da9e-8a5a-4ee3-9abb-526a26a8d464'::uuid
  ) THEN
    owner_id := 'f4b7da9e-8a5a-4ee3-9abb-526a26a8d464'::uuid;
  END IF;
  IF owner_id IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = owner_id) THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id to an existing Auth user before backfilling workout_exercises';
  END IF;
  LOCK TABLE public.workout_exercises IN ACCESS EXCLUSIVE MODE;
  CREATE TABLE account_ownership_backup_20260912._workout_exercises_before AS TABLE public.workout_exercises;
  REVOKE ALL ON account_ownership_backup_20260912._workout_exercises_before FROM PUBLIC, anon, authenticated;
  ALTER TABLE account_ownership_backup_20260912._workout_exercises_before ENABLE ROW LEVEL SECURITY;
  FOR item IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'workout_exercises'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.workout_exercises', item.policyname);
  END LOOP;
  ALTER TABLE public.workout_exercises ADD COLUMN user_id UUID;
  UPDATE public.workout_exercises SET user_id = owner_id;
  ALTER TABLE public.workout_exercises
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT workout_exercises_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  -- A name is unique within an account, not across everyone using the application.
  FOR item IN
    SELECT c.conname FROM pg_constraint c
    WHERE c.conrelid = 'public.workout_exercises'::regclass AND c.contype = 'u'
      AND c.conkey = ARRAY[(SELECT attnum FROM pg_attribute
        WHERE attrelid = c.conrelid AND attname = 'name')]::smallint[]
  LOOP
    EXECUTE format('ALTER TABLE public.workout_exercises DROP CONSTRAINT %I', item.conname);
  END LOOP;
  FOR item IN
    SELECT indexrelid::regclass AS index_name FROM pg_index
    WHERE indrelid = 'public.workout_exercises'::regclass AND indisunique AND NOT indisprimary
      AND indnkeyatts = 1 AND indexprs IS NULL
      AND indkey[0] = (SELECT attnum FROM pg_attribute
        WHERE attrelid = 'public.workout_exercises'::regclass AND attname = 'name')
  LOOP
    EXECUTE format('DROP INDEX %s', item.index_name);
  END LOOP;
  ALTER TABLE public.workout_exercises ADD UNIQUE (user_id, name);
  ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.workout_exercises FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_exercises TO authenticated;
  CREATE POLICY account_access ON public.workout_exercises FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  SELECT EXISTS (
    (SELECT to_jsonb(t) - 'user_id' FROM account_ownership_backup_20260912._workout_exercises_before t
      EXCEPT ALL SELECT to_jsonb(t) - 'user_id' FROM public.workout_exercises t)
    UNION ALL
    (SELECT to_jsonb(t) - 'user_id' FROM public.workout_exercises t
      EXCEPT ALL SELECT to_jsonb(t) - 'user_id' FROM account_ownership_backup_20260912._workout_exercises_before t)
  ) INTO different;
  IF different THEN RAISE EXCEPTION 'Original values changed in workout_exercises. Rolling back.'; END IF;
END;
$$;
