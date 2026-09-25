-- Run only against a disposable database after the full migration chain.
BEGIN;
INSERT INTO auth.users (id) VALUES
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222')
ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
INSERT INTO public.goals (id, title, currency, target_amount)
VALUES ('33333333-3333-4333-8333-333333333333', 'Private goal', 'MMK', 500);
INSERT INTO public.goal_settings (show_completed_on_home) VALUES (false);
INSERT INTO public.goals (id, title, currency)
VALUES ('33333333-3333-4333-8333-333333333333', 'Updated goal', 'MMK')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
INSERT INTO public.goal_settings (show_completed_on_home) VALUES (false)
ON CONFLICT (user_id) DO UPDATE SET show_completed_on_home = EXCLUDED.show_completed_on_home;

DO $$ BEGIN
  IF (SELECT count(*) FROM public.goals) <> 1 THEN RAISE EXCEPTION 'Owner cannot read goal'; END IF;
  IF (SELECT show_completed_on_home FROM public.goal_settings) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Owner cannot read settings';
  END IF;
  BEGIN
    UPDATE public.goals SET user_id = '22222222-2222-4222-8222-222222222222';
    RAISE EXCEPTION 'Owner transfer allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.goals (id, title, currency, target_amount)
    VALUES ('44444444-4444-4444-8444-444444444444', 'Invalid', 'MMK', -1);
    RAISE EXCEPTION 'Invalid amount accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

SELECT set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
DO $$ DECLARE changed integer; BEGIN
  IF (SELECT count(*) FROM public.goals) <> 0 THEN RAISE EXCEPTION 'Cross-owner goal read allowed'; END IF;
  IF (SELECT count(*) FROM public.goal_settings) <> 0 THEN RAISE EXCEPTION 'Cross-owner settings read allowed'; END IF;
  UPDATE public.goals SET title = 'Stolen' WHERE id = '33333333-3333-4333-8333-333333333333';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Cross-owner goal update allowed'; END IF;
  DELETE FROM public.goals WHERE id = '33333333-3333-4333-8333-333333333333';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Cross-owner goal delete allowed'; END IF;
  BEGIN
    INSERT INTO public.goals (id, user_id, title, currency)
    VALUES ('55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', 'Forged', 'MMK');
    RAISE EXCEPTION 'Forged owner accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.goals (id, title, currency)
    VALUES ('33333333-3333-4333-8333-333333333333', 'Stolen', 'MMK')
    ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
    RAISE EXCEPTION 'Cross-owner upsert allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;

INSERT INTO public.goals (id, title, currency)
VALUES ('66666666-6666-4666-8666-666666666666', 'Second owner', 'USDT');
INSERT INTO public.goal_settings (show_completed_on_home) VALUES (true);

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
DO $$ BEGIN
  BEGIN
    PERFORM 1 FROM public.goals;
    RAISE EXCEPTION 'Anonymous goal read allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM 1 FROM public.goal_settings;
    RAISE EXCEPTION 'Anonymous settings read allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;
