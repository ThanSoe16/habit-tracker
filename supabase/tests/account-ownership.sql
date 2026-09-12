-- Run after the full migration chain and synthetic auth fixtures. No owner/admin assertions.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
INSERT INTO public.user_profiles (id,name) VALUES ('test-profile','Private');
INSERT INTO public.habits (id,name) VALUES ('test-habit','Private');
INSERT INTO public.custom_units (name) VALUES ('pages');
INSERT INTO public.mood_entries (date_key,mood,label,emoji) VALUES ('2026-09-12','Good','Good',':)');
INSERT INTO public.gym_plans (day_index,day_name,title) VALUES ('6','Sunday','Private');
INSERT INTO public.gym_custom_exercises (id,name,category) VALUES ('test-exercise','Private','Chest');
INSERT INTO public.workout_logs (date_key,workout_data) VALUES ('2026-09-12','{}');
INSERT INTO public.current_budget (currency,balance) VALUES ('TEST','42');
INSERT INTO public.family_budgets (id,person,amount,date) VALUES ('test-family','Private','42','2026-09-12');
INSERT INTO public.incomes (id,title,amount,date) VALUES ('test-income','Private','42','2026-09-12');
INSERT INTO public.expenses (id,title,amount,date) VALUES ('test-expense','Private','42','2026-09-12');
INSERT INTO public.monthly_salary (id,title,amount) VALUES ('test-salary','Private','42');
INSERT INTO public.budget_settings (id) VALUES ('test-settings');
INSERT INTO public.currency_exchanges (id,title,from_currency,from_amount,to_currency,to_amount,date) VALUES ('test-exchange','Private','USDT','42','THB','142','2026-09-12');
INSERT INTO public.loans (id,type,person_name,amount,currency,date) VALUES ('test-loan','lend','Private','42','USDT','2026-09-12');
INSERT INTO public.gold_holdings (id,kyat,buy_price,purchase_date) VALUES ('test-gold','1','42','2026-09-12');
INSERT INTO public.gym_body_metrics (weight_kg,logged_at) VALUES ('70','2026-09-12');
INSERT INTO public.media_items (type,title,data_url,mime_type) VALUES ('photo','Private','data:test','image/png');
DO $$ DECLARE t TEXT; n INTEGER; before_rows JSONB; after_rows JSONB;
BEGIN
 FOREACH t IN ARRAY ARRAY['user_profiles','habits','custom_units','mood_entries','gym_plans','gym_custom_exercises','workout_logs','current_budget','family_budgets','incomes','expenses','monthly_salary','budget_settings','currency_exchanges','loans','gold_holdings','gym_body_metrics','media_items'] LOOP
  -- Own read and update succeed; ownership changes fail.
  EXECUTE format('SELECT count(*) FROM public.%I', t) INTO n;
  IF n = 0 THEN RAISE EXCEPTION 'Own select failed: %', t; END IF;
  EXECUTE format('UPDATE public.%I SET user_id = auth.uid()', t);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 THEN RAISE EXCEPTION 'Own update failed: %', t; END IF;
  BEGIN
   EXECUTE format('UPDATE public.%I SET user_id = %L', t, '22222222-2222-4222-8222-222222222222');
   RAISE EXCEPTION 'Ownership transfer allowed: %', t;
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  EXECUTE format('SELECT jsonb_agg(to_jsonb(x) ORDER BY to_jsonb(x)::text) FROM public.%I x', t) INTO before_rows;
  PERFORM set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
  EXECUTE format('SELECT count(*) FROM public.%I WHERE user_id = %L', t, '11111111-1111-4111-8111-111111111111') INTO n;
  IF n <> 0 THEN RAISE EXCEPTION 'Cross-owner select allowed: %', t; END IF;
  EXECUTE format('UPDATE public.%I SET user_id = auth.uid() WHERE user_id = %L', t, '11111111-1111-4111-8111-111111111111');
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'Cross-owner update allowed: %', t; END IF;
  EXECUTE format('DELETE FROM public.%I WHERE user_id = %L', t, '11111111-1111-4111-8111-111111111111');
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'Cross-owner delete allowed: %', t; END IF;
  PERFORM set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
  EXECUTE format('SELECT jsonb_agg(to_jsonb(x) ORDER BY to_jsonb(x)::text) FROM public.%I x', t) INTO after_rows;
  IF before_rows IS DISTINCT FROM after_rows THEN RAISE EXCEPTION 'Protected rows changed: %', t; END IF;
  RAISE NOTICE 'PASS CRUD isolation: %', t;
 END LOOP;
END $$;
-- Same natural keys work for a different account.
SELECT set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
INSERT INTO public.user_profiles (id,name) VALUES ('test-profile','Private');
INSERT INTO public.custom_units (name) VALUES ('pages');
INSERT INTO public.mood_entries (date_key,mood,label,emoji) VALUES ('2026-09-12','Good','Good',':)');
INSERT INTO public.gym_plans (day_index,day_name,title) VALUES ('6','Sunday','Private');
INSERT INTO public.workout_logs (date_key,workout_data) VALUES ('2026-09-12','{}');
INSERT INTO public.current_budget (currency,balance) VALUES ('TEST','42');
INSERT INTO public.budget_settings (id) VALUES ('test-settings');
INSERT INTO public.monthly_salary (id,title,amount) VALUES ('test-salary','Private','42');
INSERT INTO public.incomes (id,title,amount,date) VALUES ('test-income','Private','42','2026-09-12');
INSERT INTO public.expenses (id,title,amount,date) VALUES ('test-expense','Private','42','2026-09-12');
DO $$ BEGIN
 BEGIN
  INSERT INTO public.habits(id, name, user_id) VALUES ('forged', 'Forged', '11111111-1111-4111-8111-111111111111');
  RAISE EXCEPTION 'Forged owner accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  INSERT INTO public.gold_holdings(id, kyat, buy_price, purchase_date) VALUES ('invalid', 1, -10, '2026-09-12');
  RAISE EXCEPTION 'Constraint bypass allowed';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
  PERFORM public.seed_digital_wellbeing_defaults('11111111-1111-4111-8111-111111111111');
  RAISE EXCEPTION 'Privileged seed exposed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
DELETE FROM public.user_profiles;
DELETE FROM public.habits;
DELETE FROM public.custom_units;
DELETE FROM public.mood_entries;
DELETE FROM public.gym_plans;
DELETE FROM public.gym_custom_exercises;
DELETE FROM public.workout_logs;
DELETE FROM public.current_budget;
DELETE FROM public.family_budgets;
DELETE FROM public.incomes;
DELETE FROM public.expenses;
DELETE FROM public.monthly_salary;
DELETE FROM public.budget_settings;
DELETE FROM public.currency_exchanges;
DELETE FROM public.loans;
DELETE FROM public.gold_holdings;
DELETE FROM public.gym_body_metrics;
DELETE FROM public.media_items;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
DO $$ DECLARE t TEXT; BEGIN
 FOREACH t IN ARRAY ARRAY['user_profiles','habits','custom_units','mood_entries','gym_plans','gym_custom_exercises','workout_logs','current_budget','family_budgets','incomes','expenses','monthly_salary','budget_settings','currency_exchanges','loans','gold_holdings','gym_body_metrics','media_items','push_subscriptions','habit_reminder_deliveries'] LOOP
  BEGIN
   EXECUTE format('SELECT 1 FROM public.%I', t);
   RAISE EXCEPTION 'Anonymous access allowed: %', t;
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 END LOOP;
END $$;
ROLLBACK;
