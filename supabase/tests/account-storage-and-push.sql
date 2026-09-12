BEGIN;
-- Administrative fixture setup only.
INSERT INTO auth.users(id,email) VALUES ('33333333-3333-4333-8333-333333333333','signup@example.test');
INSERT INTO public.push_subscriptions(id,user_id,endpoint,p256dh,auth) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','https://push.example/a','key','secret'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','https://push.example/b','key','secret');
-- Worker relationships enforced even for privileged writes.
DO $$ BEGIN
 BEGIN
  INSERT INTO public.habit_reminder_deliveries(user_id,subscription_id,habit_id,reminder_date,scheduled_time)
  VALUES ('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','legacy-habit','2026-09-12','08:00');
  RAISE EXCEPTION 'Cross-owner reminder allowed';
 EXCEPTION WHEN foreign_key_violation THEN NULL; END;
END $$;
INSERT INTO public.habit_reminder_deliveries(user_id,subscription_id,habit_id,reminder_date,scheduled_time)
VALUES ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','legacy-habit','2026-09-12','08:00');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id='default_user' AND name='signup') THEN
  RAISE EXCEPTION 'Signup profile missing'; END IF;
 IF EXISTS (SELECT 1 FROM public.habits) THEN RAISE EXCEPTION 'Signup sees legacy habits'; END IF;
 BEGIN
  PERFORM 1 FROM public.push_subscriptions;
  RAISE EXCEPTION 'Push secrets exposed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
INSERT INTO storage.objects(bucket_id,name,owner_id)
VALUES ('media_store','11111111-1111-4111-8111-111111111111/own.jpg',auth.uid()::text);
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE name='store/legacy.jpg') THEN
  RAISE EXCEPTION 'Legacy media unavailable to selected owner'; END IF;
 BEGIN
  INSERT INTO storage.objects(bucket_id,name,owner_id) VALUES ('media_store','22222222-2222-4222-8222-222222222222/spoof.jpg',auth.uid()::text);
  RAISE EXCEPTION 'Foreign folder upload allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
DO $$ DECLARE n INTEGER; BEGIN
 IF EXISTS (SELECT 1 FROM storage.objects) THEN RAISE EXCEPTION 'Cross-owner media visible'; END IF;
 DELETE FROM storage.objects;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>0 THEN RAISE EXCEPTION 'Cross-owner media deleted'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
DO $$ BEGIN
 IF (SELECT count(*) FROM storage.objects) <> 2 THEN RAISE EXCEPTION 'Protected media changed'; END IF;
END $$;
DELETE FROM storage.objects WHERE name LIKE '%/own.jpg';
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub','',true);
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM storage.objects) THEN RAISE EXCEPTION 'Anonymous media exposed'; END IF;
END $$;
RESET ROLE;
DELETE FROM auth.users WHERE id='33333333-3333-4333-8333-333333333333';
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id='33333333-3333-4333-8333-333333333333') THEN
  RAISE EXCEPTION 'Profile cascade failed'; END IF;
END $$;
ROLLBACK;
