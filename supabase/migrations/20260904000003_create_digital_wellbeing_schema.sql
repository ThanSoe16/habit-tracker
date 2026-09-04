-- Complete authenticated-user schema for the Digital Wellbeing module.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.digital_wellbeing_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  screen_time_seconds INTEGER NOT NULL DEFAULT 0 CHECK (screen_time_seconds >= 0),
  focus_time_seconds INTEGER NOT NULL DEFAULT 0 CHECK (focus_time_seconds >= 0),
  pickup_count INTEGER NOT NULL DEFAULT 0 CHECK (pickup_count >= 0),
  notification_count INTEGER NOT NULL DEFAULT 0 CHECK (notification_count >= 0),
  late_night_usage_seconds INTEGER NOT NULL DEFAULT 0 CHECK (late_night_usage_seconds >= 0),
  app_limit_violations INTEGER NOT NULL DEFAULT 0 CHECK (app_limit_violations >= 0),
  wellbeing_score INTEGER CHECK (wellbeing_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT digital_wellbeing_daily_usage_user_date_key UNIQUE (user_id, usage_date)
);

CREATE TABLE IF NOT EXISTS public.digital_wellbeing_app_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  app_identifier TEXT NOT NULL CHECK (length(btrim(app_identifier)) > 0),
  app_name TEXT NOT NULL CHECK (length(btrim(app_name)) > 0),
  app_icon_url TEXT,
  category TEXT CHECK (category IS NULL OR category IN (
    'SOCIAL', 'ENTERTAINMENT', 'PRODUCTIVITY', 'GAMES', 'EDUCATION',
    'COMMUNICATION', 'FINANCE', 'HEALTH', 'SHOPPING', 'OTHER'
  )),
  usage_seconds INTEGER NOT NULL DEFAULT 0 CHECK (usage_seconds >= 0),
  open_count INTEGER NOT NULL DEFAULT 0 CHECK (open_count >= 0),
  notification_count INTEGER NOT NULL DEFAULT 0 CHECK (notification_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT digital_wellbeing_app_usage_user_date_app_key
    UNIQUE (user_id, usage_date, app_identifier)
);

CREATE TABLE IF NOT EXISTS public.digital_wellbeing_app_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_identifier TEXT NOT NULL CHECK (length(btrim(app_identifier)) > 0),
  app_name TEXT NOT NULL CHECK (length(btrim(app_name)) > 0),
  daily_limit_seconds INTEGER NOT NULL CHECK (daily_limit_seconds > 0),
  warning_before_seconds INTEGER NOT NULL DEFAULT 300 CHECK (warning_before_seconds >= 0),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT digital_wellbeing_app_limits_user_app_key UNIQUE (user_id, app_identifier)
);

CREATE TABLE IF NOT EXISTS public.digital_wellbeing_focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  planned_duration_seconds INTEGER NOT NULL CHECK (planned_duration_seconds > 0),
  completed_duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (completed_duration_seconds >= 0),
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
  pause_count INTEGER NOT NULL DEFAULT 0 CHECK (pause_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE TABLE IF NOT EXISTS public.digital_wellbeing_focus_session_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  focus_session_id UUID NOT NULL
    REFERENCES public.digital_wellbeing_focus_sessions(id) ON DELETE CASCADE,
  app_identifier TEXT NOT NULL CHECK (length(btrim(app_identifier)) > 0),
  app_name TEXT NOT NULL CHECK (length(btrim(app_name)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT digital_wellbeing_focus_session_apps_session_app_key
    UNIQUE (focus_session_id, app_identifier)
);

CREATE TABLE IF NOT EXISTS public.digital_wellbeing_bedtime_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bedtime TIME,
  wake_time TIME,
  active_days SMALLINT[] NOT NULL DEFAULT ARRAY[1, 2, 3, 4, 5]::SMALLINT[],
  bedtime_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  reduce_notifications BOOLEAN NOT NULL DEFAULT false,
  reduce_distracting_apps BOOLEAN NOT NULL DEFAULT false,
  grayscale_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CHECK (active_days <@ ARRAY[1, 2, 3, 4, 5, 6, 7]::SMALLINT[])
);

CREATE TABLE IF NOT EXISTS public.digital_wellbeing_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(btrim(title)) > 0),
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN (
    'SCREEN_TIME_LIMIT', 'APP_USAGE_LIMIT', 'FOCUS_TIME', 'FOCUS_SESSION_COUNT',
    'NO_LATE_NIGHT_USAGE', 'REDUCE_APP_USAGE', 'PICKUP_LIMIT', 'CUSTOM'
  )),
  target_value NUMERIC,
  target_unit TEXT CHECK (target_unit IS NULL OR target_unit IN ('SECONDS', 'COUNT', 'PERCENT')),
  duration_days INTEGER CHECK (duration_days IS NULL OR duration_days > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.digital_wellbeing_user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.digital_wellbeing_challenges(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  ended_at TIMESTAMPTZ,
  current_value NUMERIC NOT NULL DEFAULT 0 CHECK (current_value >= 0),
  target_value NUMERIC NOT NULL CHECK (target_value >= 0),
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CHECK (ended_at IS NULL OR ended_at >= started_at),
  CHECK (completed_at IS NULL OR completed_at >= started_at)
);

CREATE TABLE IF NOT EXISTS public.digital_wellbeing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_screen_time_goal_seconds INTEGER
    CHECK (daily_screen_time_goal_seconds IS NULL OR daily_screen_time_goal_seconds > 0),
  daily_focus_goal_seconds INTEGER
    CHECK (daily_focus_goal_seconds IS NULL OR daily_focus_goal_seconds >= 0),
  daily_pickup_goal INTEGER CHECK (daily_pickup_goal IS NULL OR daily_pickup_goal >= 0),
  screen_time_warning_enabled BOOLEAN NOT NULL DEFAULT true,
  excessive_usage_warning_enabled BOOLEAN NOT NULL DEFAULT true,
  app_limit_warning_enabled BOOLEAN NOT NULL DEFAULT true,
  default_focus_duration_seconds INTEGER NOT NULL DEFAULT 1500
    CHECK (default_focus_duration_seconds > 0),
  focus_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  allow_emergency_focus_break BOOLEAN NOT NULL DEFAULT true,
  daily_summary_enabled BOOLEAN NOT NULL DEFAULT false,
  weekly_report_enabled BOOLEAN NOT NULL DEFAULT true,
  monthly_report_enabled BOOLEAN NOT NULL DEFAULT false,
  data_retention_days INTEGER CHECK (data_retention_days IS NULL OR data_retention_days > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.digital_wellbeing_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_date DATE NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'SCREEN_TIME', 'FOCUS', 'APP_USAGE', 'LATE_NIGHT_USAGE', 'PICKUPS',
    'NOTIFICATIONS', 'GOAL', 'WELLBEING_SCORE'
  )),
  title TEXT NOT NULL CHECK (length(btrim(title)) > 0),
  message TEXT NOT NULL CHECK (length(btrim(message)) > 0),
  value NUMERIC,
  previous_value NUMERIC,
  change_percent NUMERIC,
  severity TEXT NOT NULL DEFAULT 'NEUTRAL'
    CHECK (severity IN ('POSITIVE', 'NEUTRAL', 'WARNING')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_dw_daily_usage_user ON public.digital_wellbeing_daily_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_dw_daily_usage_date ON public.digital_wellbeing_daily_usage (usage_date);
CREATE INDEX IF NOT EXISTS idx_dw_app_usage_user ON public.digital_wellbeing_app_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_dw_app_usage_date ON public.digital_wellbeing_app_usage (usage_date);
CREATE INDEX IF NOT EXISTS idx_dw_app_usage_identifier ON public.digital_wellbeing_app_usage (app_identifier);
CREATE INDEX IF NOT EXISTS idx_dw_app_usage_user_date
  ON public.digital_wellbeing_app_usage (user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_dw_app_usage_user_app_date
  ON public.digital_wellbeing_app_usage (user_id, app_identifier, usage_date DESC);
CREATE INDEX IF NOT EXISTS idx_dw_app_usage_top_apps
  ON public.digital_wellbeing_app_usage (user_id, usage_date, usage_seconds DESC);
CREATE INDEX IF NOT EXISTS idx_dw_app_limits_user ON public.digital_wellbeing_app_limits (user_id);
CREATE INDEX IF NOT EXISTS idx_dw_app_limits_enabled
  ON public.digital_wellbeing_app_limits (user_id, is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_dw_focus_sessions_user_started
  ON public.digital_wellbeing_focus_sessions (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_dw_focus_sessions_current
  ON public.digital_wellbeing_focus_sessions (user_id, started_at DESC)
  WHERE status IN ('ACTIVE', 'PAUSED');
CREATE INDEX IF NOT EXISTS idx_dw_focus_apps_session
  ON public.digital_wellbeing_focus_session_apps (focus_session_id);
CREATE INDEX IF NOT EXISTS idx_dw_challenges_active
  ON public.digital_wellbeing_challenges (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_dw_user_challenges_user
  ON public.digital_wellbeing_user_challenges (user_id);
CREATE INDEX IF NOT EXISTS idx_dw_user_challenges_challenge
  ON public.digital_wellbeing_user_challenges (challenge_id);
CREATE INDEX IF NOT EXISTS idx_dw_user_challenges_status
  ON public.digital_wellbeing_user_challenges (status);
CREATE INDEX IF NOT EXISTS idx_dw_user_challenges_user_status
  ON public.digital_wellbeing_user_challenges (user_id, status);
CREATE INDEX IF NOT EXISTS idx_dw_insights_user_date
  ON public.digital_wellbeing_insights (user_id, insight_date DESC);
CREATE INDEX IF NOT EXISTS idx_dw_insights_unread
  ON public.digital_wellbeing_insights (user_id, created_at DESC) WHERE is_read = false;

ALTER TABLE public.digital_wellbeing_daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_wellbeing_app_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_wellbeing_app_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_wellbeing_focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_wellbeing_focus_session_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_wellbeing_bedtime_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_wellbeing_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_wellbeing_user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_wellbeing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_wellbeing_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their daily wellbeing usage" ON public.digital_wellbeing_daily_usage;
CREATE POLICY "Users manage their daily wellbeing usage"
  ON public.digital_wellbeing_daily_usage FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their wellbeing app usage" ON public.digital_wellbeing_app_usage;
CREATE POLICY "Users manage their wellbeing app usage"
  ON public.digital_wellbeing_app_usage FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their wellbeing app limits" ON public.digital_wellbeing_app_limits;
CREATE POLICY "Users manage their wellbeing app limits"
  ON public.digital_wellbeing_app_limits FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their wellbeing focus sessions" ON public.digital_wellbeing_focus_sessions;
CREATE POLICY "Users manage their wellbeing focus sessions"
  ON public.digital_wellbeing_focus_sessions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage apps in their focus sessions" ON public.digital_wellbeing_focus_session_apps;
CREATE POLICY "Users manage apps in their focus sessions"
  ON public.digital_wellbeing_focus_session_apps FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.digital_wellbeing_focus_sessions AS focus_session
    WHERE focus_session.id = focus_session_id AND focus_session.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.digital_wellbeing_focus_sessions AS focus_session
    WHERE focus_session.id = focus_session_id AND focus_session.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users manage their wellbeing bedtime settings" ON public.digital_wellbeing_bedtime_settings;
CREATE POLICY "Users manage their wellbeing bedtime settings"
  ON public.digital_wellbeing_bedtime_settings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view active wellbeing challenges" ON public.digital_wellbeing_challenges;
CREATE POLICY "Users view active wellbeing challenges"
  ON public.digital_wellbeing_challenges FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Users manage their wellbeing challenges" ON public.digital_wellbeing_user_challenges;
CREATE POLICY "Users manage their wellbeing challenges"
  ON public.digital_wellbeing_user_challenges FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their digital wellbeing settings" ON public.digital_wellbeing_settings;
CREATE POLICY "Users manage their digital wellbeing settings"
  ON public.digital_wellbeing_settings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their wellbeing insights" ON public.digital_wellbeing_insights;
CREATE POLICY "Users manage their wellbeing insights"
  ON public.digital_wellbeing_insights FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'digital_wellbeing_daily_usage',
    'digital_wellbeing_app_usage',
    'digital_wellbeing_app_limits',
    'digital_wellbeing_focus_sessions',
    'digital_wellbeing_bedtime_settings',
    'digital_wellbeing_challenges',
    'digital_wellbeing_user_challenges',
    'digital_wellbeing_settings'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', table_name);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      table_name
    );
  END LOOP;
END;
$$;
