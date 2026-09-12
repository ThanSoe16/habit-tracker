-- Account isolation. The fallback below is the explicitly verified owner of this project.
-- Other installations must SET LOCAL app.legacy_owner_id to their verified Auth UUID.
-- Missing/ambiguous ownership aborts; backups and value checks protect existing records.
DO $$
DECLARE
  owner_id UUID := nullif(current_setting('app.legacy_owner_id', true), '')::uuid;
  policy_record RECORD;
  source_table RECORD;
  automatic_owner BOOLEAN := owner_id IS NULL;
  different BOOLEAN;
  n BIGINT;
BEGIN
  LOCK TABLE auth.users IN SHARE MODE;
  IF automatic_owner THEN
    IF (SELECT count(*) FROM auth.users) <> 1 OR NOT EXISTS (
      SELECT 1 FROM auth.users WHERE id = 'f4b7da9e-8a5a-4ee3-9abb-526a26a8d464'::uuid
    ) THEN
      RAISE EXCEPTION 'Set app.legacy_owner_id explicitly: the verified sole account no longer matches';
    END IF;
    owner_id := 'f4b7da9e-8a5a-4ee3-9abb-526a26a8d464'::uuid;
  END IF;
  IF owner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = owner_id) THEN
    RAISE EXCEPTION 'app.legacy_owner_id must reference an existing auth user';
  END IF;
  -- Retain private row copies. A pre-existing backup causes failure, never overwrite it.
  CREATE SCHEMA account_ownership_backup_20260912;
  REVOKE ALL ON SCHEMA account_ownership_backup_20260912 FROM PUBLIC, anon, authenticated;
  CREATE TABLE account_ownership_backup_20260912._owner (user_id UUID NOT NULL);
  INSERT INTO account_ownership_backup_20260912._owner VALUES (owner_id);
  CREATE TABLE account_ownership_backup_20260912._record_counts (
    table_name TEXT PRIMARY KEY, rows_before BIGINT, rows_after BIGINT
  );
  FOR source_table IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename LOOP
    EXECUTE format('LOCK TABLE public.%I IN ACCESS EXCLUSIVE MODE', source_table.tablename);
    IF automatic_owner AND EXISTS (SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = source_table.tablename AND column_name = 'user_id') THEN
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I WHERE user_id IS NOT NULL AND user_id::text NOT IN (%L, %L))',
        source_table.tablename, owner_id::text, 'default_user') INTO different;
      IF different THEN RAISE EXCEPTION 'Unexpected owner in %. No data changed.', source_table.tablename; END IF;
    END IF;
    EXECUTE format('CREATE TABLE account_ownership_backup_20260912.%I AS TABLE public.%I', source_table.tablename, source_table.tablename);
    EXECUTE format('ALTER TABLE account_ownership_backup_20260912.%I ENABLE ROW LEVEL SECURITY', source_table.tablename);
    EXECUTE format('SELECT count(*) FROM public.%I', source_table.tablename) INTO n;
    INSERT INTO account_ownership_backup_20260912._record_counts VALUES (source_table.tablename, n, NULL);
  END LOOP;
  LOCK TABLE storage.objects, storage.buckets IN SHARE ROW EXCLUSIVE MODE;
  CREATE TABLE account_ownership_backup_20260912._storage_objects AS TABLE storage.objects;
  CREATE TABLE account_ownership_backup_20260912._storage_buckets AS TABLE storage.buckets;
  REVOKE ALL ON ALL TABLES IN SCHEMA account_ownership_backup_20260912 FROM PUBLIC, anon, authenticated;

  -- user_profiles
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles' LOOP
    EXECUTE format('DROP POLICY %I ON public.user_profiles', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.user_profiles ADD COLUMN user_id UUID;
  UPDATE public.user_profiles p SET user_id = u.id FROM auth.users u WHERE p.id = u.id::text;
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing user_profiles data';
  END IF;
  UPDATE public.user_profiles SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.user_profiles
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.user_profiles DROP CONSTRAINT user_profiles_pkey;
  ALTER TABLE public.user_profiles ADD PRIMARY KEY (user_id, id);
  ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.user_profiles FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
  CREATE POLICY account_access ON public.user_profiles FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- habits
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'habits' LOOP
    EXECUTE format('DROP POLICY %I ON public.habits', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.habits ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.habits WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing habits data';
  END IF;
  UPDATE public.habits SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.habits
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  CREATE INDEX ON public.habits (user_id);
  ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.habits FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
  CREATE POLICY account_access ON public.habits FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- custom_units
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'custom_units' LOOP
    EXECUTE format('DROP POLICY %I ON public.custom_units', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.custom_units ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.custom_units WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing custom_units data';
  END IF;
  UPDATE public.custom_units SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.custom_units
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT custom_units_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.custom_units DROP CONSTRAINT custom_units_pkey;
  ALTER TABLE public.custom_units ADD PRIMARY KEY (user_id, name);
  ALTER TABLE public.custom_units ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.custom_units FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_units TO authenticated;
  CREATE POLICY account_access ON public.custom_units FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- mood_entries
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mood_entries' LOOP
    EXECUTE format('DROP POLICY %I ON public.mood_entries', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.mood_entries ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.mood_entries WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing mood_entries data';
  END IF;
  UPDATE public.mood_entries SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.mood_entries
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT mood_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.mood_entries DROP CONSTRAINT mood_entries_pkey;
  ALTER TABLE public.mood_entries ADD PRIMARY KEY (user_id, date_key);
  ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.mood_entries FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_entries TO authenticated;
  CREATE POLICY account_access ON public.mood_entries FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- gym_plans
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gym_plans' LOOP
    EXECUTE format('DROP POLICY %I ON public.gym_plans', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.gym_plans ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.gym_plans WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing gym_plans data';
  END IF;
  UPDATE public.gym_plans SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.gym_plans
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT gym_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.gym_plans DROP CONSTRAINT gym_plans_pkey;
  ALTER TABLE public.gym_plans ADD PRIMARY KEY (user_id, day_index);
  ALTER TABLE public.gym_plans ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.gym_plans FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_plans TO authenticated;
  CREATE POLICY account_access ON public.gym_plans FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- gym_custom_exercises
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gym_custom_exercises' LOOP
    EXECUTE format('DROP POLICY %I ON public.gym_custom_exercises', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.gym_custom_exercises ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.gym_custom_exercises WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing gym_custom_exercises data';
  END IF;
  UPDATE public.gym_custom_exercises SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.gym_custom_exercises
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT gym_custom_exercises_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  CREATE INDEX ON public.gym_custom_exercises (user_id);
  ALTER TABLE public.gym_custom_exercises ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.gym_custom_exercises FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_custom_exercises TO authenticated;
  CREATE POLICY account_access ON public.gym_custom_exercises FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- workout_logs
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workout_logs' LOOP
    EXECUTE format('DROP POLICY %I ON public.workout_logs', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.workout_logs ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.workout_logs WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing workout_logs data';
  END IF;
  UPDATE public.workout_logs SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.workout_logs
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT workout_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.workout_logs DROP CONSTRAINT workout_logs_pkey;
  ALTER TABLE public.workout_logs ADD PRIMARY KEY (user_id, date_key);
  ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.workout_logs FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_logs TO authenticated;
  CREATE POLICY account_access ON public.workout_logs FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- current_budget
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'current_budget' LOOP
    EXECUTE format('DROP POLICY %I ON public.current_budget', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.current_budget ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.current_budget WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing current_budget data';
  END IF;
  UPDATE public.current_budget SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.current_budget
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT current_budget_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.current_budget DROP CONSTRAINT current_budget_pkey;
  ALTER TABLE public.current_budget ADD PRIMARY KEY (user_id, currency);
  ALTER TABLE public.current_budget ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.current_budget FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.current_budget TO authenticated;
  CREATE POLICY account_access ON public.current_budget FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- family_budgets
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'family_budgets' LOOP
    EXECUTE format('DROP POLICY %I ON public.family_budgets', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.family_budgets ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.family_budgets WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing family_budgets data';
  END IF;
  UPDATE public.family_budgets SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.family_budgets
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT family_budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.family_budgets DROP CONSTRAINT family_budgets_pkey;
  ALTER TABLE public.family_budgets ADD PRIMARY KEY (user_id, id);
  ALTER TABLE public.family_budgets ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.family_budgets FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_budgets TO authenticated;
  CREATE POLICY account_access ON public.family_budgets FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- incomes
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'incomes' LOOP
    EXECUTE format('DROP POLICY %I ON public.incomes', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.incomes ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.incomes WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing incomes data';
  END IF;
  UPDATE public.incomes SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.incomes
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT incomes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.incomes DROP CONSTRAINT incomes_pkey;
  ALTER TABLE public.incomes ADD PRIMARY KEY (user_id, id);
  ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.incomes FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.incomes TO authenticated;
  CREATE POLICY account_access ON public.incomes FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- expenses
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'expenses' LOOP
    EXECUTE format('DROP POLICY %I ON public.expenses', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.expenses ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.expenses WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing expenses data';
  END IF;
  UPDATE public.expenses SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.expenses
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.expenses DROP CONSTRAINT expenses_pkey;
  ALTER TABLE public.expenses ADD PRIMARY KEY (user_id, id);
  ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.expenses FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
  CREATE POLICY account_access ON public.expenses FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- monthly_salary
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'monthly_salary' LOOP
    EXECUTE format('DROP POLICY %I ON public.monthly_salary', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.monthly_salary ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.monthly_salary WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing monthly_salary data';
  END IF;
  UPDATE public.monthly_salary SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.monthly_salary
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT monthly_salary_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.monthly_salary DROP CONSTRAINT monthly_salary_pkey;
  ALTER TABLE public.monthly_salary ADD PRIMARY KEY (user_id, id);
  ALTER TABLE public.monthly_salary ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.monthly_salary FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_salary TO authenticated;
  CREATE POLICY account_access ON public.monthly_salary FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- budget_settings
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'budget_settings' LOOP
    EXECUTE format('DROP POLICY %I ON public.budget_settings', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.budget_settings ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.budget_settings WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing budget_settings data';
  END IF;
  UPDATE public.budget_settings SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.budget_settings
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT budget_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.budget_settings DROP CONSTRAINT budget_settings_pkey;
  ALTER TABLE public.budget_settings ADD PRIMARY KEY (user_id, id);
  ALTER TABLE public.budget_settings ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.budget_settings FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_settings TO authenticated;
  CREATE POLICY account_access ON public.budget_settings FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- currency_exchanges
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'currency_exchanges' LOOP
    EXECUTE format('DROP POLICY %I ON public.currency_exchanges', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.currency_exchanges ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.currency_exchanges WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing currency_exchanges data';
  END IF;
  UPDATE public.currency_exchanges SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.currency_exchanges
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT currency_exchanges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.currency_exchanges DROP CONSTRAINT currency_exchanges_pkey;
  ALTER TABLE public.currency_exchanges ADD PRIMARY KEY (user_id, id);
  ALTER TABLE public.currency_exchanges ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.currency_exchanges FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.currency_exchanges TO authenticated;
  CREATE POLICY account_access ON public.currency_exchanges FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- loans
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'loans' LOOP
    EXECUTE format('DROP POLICY %I ON public.loans', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.loans ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.loans WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing loans data';
  END IF;
  UPDATE public.loans SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.loans
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT loans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.loans DROP CONSTRAINT loans_pkey;
  ALTER TABLE public.loans ADD PRIMARY KEY (user_id, id);
  ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.loans FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.loans TO authenticated;
  CREATE POLICY account_access ON public.loans FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- gold_holdings
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gold_holdings' LOOP
    EXECUTE format('DROP POLICY %I ON public.gold_holdings', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.gold_holdings ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.gold_holdings WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing gold_holdings data';
  END IF;
  UPDATE public.gold_holdings SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.gold_holdings
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT gold_holdings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.gold_holdings DROP CONSTRAINT gold_holdings_pkey;
  ALTER TABLE public.gold_holdings ADD PRIMARY KEY (user_id, id);
  ALTER TABLE public.gold_holdings ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.gold_holdings FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.gold_holdings TO authenticated;
  CREATE POLICY account_access ON public.gold_holdings FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- gym_body_metrics
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gym_body_metrics' LOOP
    EXECUTE format('DROP POLICY %I ON public.gym_body_metrics', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.gym_body_metrics ALTER COLUMN user_id DROP DEFAULT;
  UPDATE public.gym_body_metrics SET user_id = owner_id::text WHERE user_id = 'default_user';
  ALTER TABLE public.gym_body_metrics ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
  IF EXISTS (SELECT 1 FROM public.gym_body_metrics WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing gym_body_metrics data';
  END IF;
  UPDATE public.gym_body_metrics SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.gym_body_metrics
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT gym_body_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  CREATE INDEX ON public.gym_body_metrics (user_id);
  ALTER TABLE public.gym_body_metrics ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.gym_body_metrics FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_body_metrics TO authenticated;
  CREATE POLICY account_access ON public.gym_body_metrics FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- media_items
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'media_items' LOOP
    EXECUTE format('DROP POLICY %I ON public.media_items', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.media_items ALTER COLUMN user_id DROP DEFAULT;
  UPDATE public.media_items SET user_id = owner_id::text WHERE user_id = 'default_user';
  ALTER TABLE public.media_items ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
  IF EXISTS (SELECT 1 FROM public.media_items WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing media_items data';
  END IF;
  UPDATE public.media_items SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.media_items
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT media_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  CREATE INDEX ON public.media_items (user_id);
  ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.media_items FROM anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_items TO authenticated;
  CREATE POLICY account_access ON public.media_items FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  -- push_subscriptions
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'push_subscriptions' LOOP
    EXECUTE format('DROP POLICY %I ON public.push_subscriptions', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.push_subscriptions ADD COLUMN user_id UUID;
  IF EXISTS (SELECT 1 FROM public.push_subscriptions WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing push_subscriptions data';
  END IF;
  UPDATE public.push_subscriptions SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.push_subscriptions
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  CREATE INDEX ON public.push_subscriptions (user_id);
  ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.push_subscriptions FROM anon, authenticated;
  -- habit_reminder_deliveries
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'habit_reminder_deliveries' LOOP
    EXECUTE format('DROP POLICY %I ON public.habit_reminder_deliveries', policy_record.policyname);
  END LOOP;
  ALTER TABLE public.habit_reminder_deliveries ADD COLUMN user_id UUID;
  UPDATE public.habit_reminder_deliveries d SET user_id = s.user_id FROM public.push_subscriptions s WHERE s.id = d.subscription_id;
  IF EXISTS (SELECT 1 FROM public.habit_reminder_deliveries WHERE user_id IS NULL) AND owner_id IS NULL THEN
    RAISE EXCEPTION 'Set app.legacy_owner_id before assigning existing habit_reminder_deliveries data';
  END IF;
  UPDATE public.habit_reminder_deliveries SET user_id = owner_id WHERE user_id IS NULL;
  ALTER TABLE public.habit_reminder_deliveries
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid(),
    ADD CONSTRAINT habit_reminder_deliveries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  CREATE INDEX ON public.habit_reminder_deliveries (user_id);
  ALTER TABLE public.habit_reminder_deliveries ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.habit_reminder_deliveries FROM anon, authenticated;
  -- Verify every original public value before the ownership statement can commit.
  FOR source_table IN SELECT table_name, rows_before FROM account_ownership_backup_20260912._record_counts LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', source_table.table_name) INTO n;
    IF n <> source_table.rows_before THEN RAISE EXCEPTION 'Row count changed in %', source_table.table_name; END IF;
    EXECUTE format(
      'SELECT EXISTS ((SELECT to_jsonb(t) - ''user_id'' FROM account_ownership_backup_20260912.%I t EXCEPT ALL SELECT to_jsonb(t) - ''user_id'' FROM public.%I t) UNION ALL (SELECT to_jsonb(t) - ''user_id'' FROM public.%I t EXCEPT ALL SELECT to_jsonb(t) - ''user_id'' FROM account_ownership_backup_20260912.%I t))',
      source_table.table_name, source_table.table_name, source_table.table_name, source_table.table_name
    ) INTO different;
    IF different THEN RAISE EXCEPTION 'Original values changed in %. Rolling back.', source_table.table_name; END IF;
    UPDATE account_ownership_backup_20260912._record_counts SET rows_after = n WHERE table_name = source_table.table_name;
  END LOOP;
END;
$$;

-- The worker cannot associate another person's habit with a subscription.
ALTER TABLE public.habits ADD UNIQUE (user_id, id);
ALTER TABLE public.push_subscriptions ADD UNIQUE (user_id, id);
ALTER TABLE public.habit_reminder_deliveries
  ADD FOREIGN KEY (user_id, habit_id) REFERENCES public.habits(user_id, id) ON DELETE CASCADE,
  ADD FOREIGN KEY (user_id, subscription_id) REFERENCES public.push_subscriptions(user_id, id) ON DELETE CASCADE;

-- Existing signup profiles retain their original keys; new accounts use the app's settings key.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, id, name, avatar_emoji, joined_at)
  VALUES (NEW.id, 'default_user', COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User'), '😊', now()::text);
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_digital_wellbeing_defaults(UUID) FROM PUBLIC, anon, authenticated;

-- Focus-session children inherit ownership through their parent; challenges are a shared,
-- read-only catalog. Neither needs a duplicate owner field.
REVOKE ALL ON public.digital_wellbeing_challenges FROM anon, authenticated;
GRANT SELECT ON public.digital_wellbeing_challenges TO authenticated;

-- Private media: legacy unowned files are explicitly assigned, never moved/deleted.
DO $$
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage'
    AND tablename = 'objects' AND (coalesce(qual, '') LIKE '%media_store%' OR coalesce(with_check, '') LIKE '%media_store%' OR coalesce(qual, '') LIKE '%workout-images%' OR coalesce(with_check, '') LIKE '%workout-images%')
  LOOP EXECUTE format('DROP POLICY %I ON storage.objects', policy_record.policyname); END LOOP;
END;
$$;
UPDATE storage.buckets SET public = false WHERE id IN ('media_store', 'workout-images');
UPDATE storage.objects SET owner_id = (SELECT user_id::text FROM account_ownership_backup_20260912._owner)
WHERE bucket_id IN ('media_store', 'workout-images') AND owner_id IS NULL;
CREATE POLICY account_media_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('media_store', 'workout-images') AND owner_id = (SELECT auth.uid())::text);
CREATE POLICY account_media_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('media_store', 'workout-images') AND owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY account_media_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('media_store', 'workout-images') AND owner_id = (SELECT auth.uid())::text);
-- Restrictive policies also defeat unrelated permissive storage policies for this bucket.
CREATE POLICY account_media_boundary ON storage.objects AS RESTRICTIVE FOR ALL TO public
  USING (bucket_id NOT IN ('media_store', 'workout-images') OR owner_id = (SELECT auth.uid())::text)
  WITH CHECK (bucket_id NOT IN ('media_store', 'workout-images') OR (owner_id = (SELECT auth.uid())::text
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text));
