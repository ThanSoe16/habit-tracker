-- Seed editable Digital Wellbeing defaults for existing and future users.

INSERT INTO public.digital_wellbeing_challenges (
  id, title, description, challenge_type, target_value, target_unit, duration_days, is_active
)
VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    'Social Detox',
    'Keep social media usage below one hour for seven days.',
    'SCREEN_TIME_LIMIT', 7, 'COUNT', 7, true
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Focus Five',
    'Complete five intentional focus sessions.',
    'FOCUS_SESSION_COUNT', 5, 'COUNT', 7, true
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Quiet Nights',
    'Avoid distracting apps during your bedtime window for five nights.',
    'NO_LATE_NIGHT_USAGE', 5, 'COUNT', 5, true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  challenge_type = EXCLUDED.challenge_type,
  target_value = EXCLUDED.target_value,
  target_unit = EXCLUDED.target_unit,
  duration_days = EXCLUDED.duration_days,
  is_active = EXCLUDED.is_active;

CREATE OR REPLACE FUNCTION public.seed_digital_wellbeing_defaults(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.digital_wellbeing_profiles (
    user_id, daily_limit_minutes, reminder_interval_minutes
  )
  VALUES (target_user_id, 60, 10)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.digital_wellbeing_settings (
    user_id,
    daily_screen_time_goal_seconds,
    daily_focus_goal_seconds,
    daily_pickup_goal,
    screen_time_warning_enabled,
    excessive_usage_warning_enabled,
    app_limit_warning_enabled,
    default_focus_duration_seconds,
    focus_notifications_enabled,
    allow_emergency_focus_break,
    daily_summary_enabled,
    weekly_report_enabled,
    monthly_report_enabled,
    data_retention_days
  )
  VALUES (
    target_user_id,
    18000,
    7200,
    60,
    true,
    true,
    true,
    1500,
    true,
    true,
    false,
    true,
    false,
    365
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.digital_wellbeing_bedtime_settings (
    user_id,
    bedtime,
    wake_time,
    active_days,
    bedtime_reminder_enabled,
    reduce_notifications,
    reduce_distracting_apps,
    grayscale_enabled
  )
  VALUES (
    target_user_id,
    '23:00'::TIME,
    '07:00'::TIME,
    ARRAY[1, 2, 3, 4, 5]::SMALLINT[],
    true,
    false,
    false,
    false
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.digital_wellbeing_daily_usage (
    user_id,
    usage_date,
    screen_time_seconds,
    focus_time_seconds,
    pickup_count,
    notification_count,
    late_night_usage_seconds,
    app_limit_violations,
    wellbeing_score
  )
  SELECT
    target_user_id,
    current_date - day_offset,
    12600 + (day_offset * 360),
    3600 + ((6 - day_offset) * 240),
    58 + (day_offset * 3),
    118 + (day_offset * 5),
    600 + (day_offset * 120),
    CASE WHEN day_offset < 3 THEN 1 ELSE 2 END,
    72 - day_offset
  FROM generate_series(0, 6) AS days(day_offset)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  INSERT INTO public.digital_wellbeing_app_usage (
    user_id,
    usage_date,
    app_identifier,
    app_name,
    category,
    usage_seconds,
    open_count,
    notification_count
  )
  SELECT
    target_user_id,
    current_date - days.day_offset,
    apps.app_identifier,
    apps.app_name,
    apps.category,
    GREATEST(300, apps.usage_seconds - (days.day_offset * 60)),
    apps.open_count,
    apps.notification_count
  FROM generate_series(0, 6) AS days(day_offset)
  CROSS JOIN (
    VALUES
      ('com.instagram.android', 'Instagram', 'SOCIAL', 3900, 18, 42),
      ('com.google.android.youtube', 'YouTube', 'ENTERTAINMENT', 2700, 7, 12),
      ('com.android.chrome', 'Chrome', 'PRODUCTIVITY', 2100, 14, 5),
      ('com.zhiliaoapp.musically', 'TikTok', 'SOCIAL', 1800, 11, 31),
      ('com.google.android.apps.messaging', 'Messages', 'COMMUNICATION', 1050, 24, 39),
      ('com.duolingo', 'Duolingo', 'EDUCATION', 750, 3, 3)
  ) AS apps(app_identifier, app_name, category, usage_seconds, open_count, notification_count)
  ON CONFLICT (user_id, usage_date, app_identifier) DO NOTHING;

  INSERT INTO public.digital_wellbeing_app_limits (
    user_id,
    app_identifier,
    app_name,
    daily_limit_seconds,
    warning_before_seconds,
    is_enabled
  )
  VALUES
    (target_user_id, 'com.instagram.android', 'Instagram', 3600, 300, true),
    (target_user_id, 'com.zhiliaoapp.musically', 'TikTok', 3600, 300, true),
    (target_user_id, 'com.google.android.youtube', 'YouTube', 7200, 600, true)
  ON CONFLICT (user_id, app_identifier) DO NOTHING;
END;
$$;

DO $$
DECLARE
  existing_user RECORD;
BEGIN
  FOR existing_user IN SELECT id FROM auth.users
  LOOP
    PERFORM public.seed_digital_wellbeing_defaults(existing_user.id);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_digital_wellbeing_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_digital_wellbeing_defaults(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS seed_digital_wellbeing_after_user_created ON auth.users;
CREATE TRIGGER seed_digital_wellbeing_after_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_digital_wellbeing_defaults();

REVOKE ALL ON FUNCTION public.seed_digital_wellbeing_defaults(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user_digital_wellbeing_defaults() FROM PUBLIC;
