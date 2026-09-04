CREATE TABLE IF NOT EXISTS public.digital_wellbeing_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_limit_minutes INTEGER NOT NULL DEFAULT 60 CHECK (daily_limit_minutes > 0),
  reminder_interval_minutes INTEGER NOT NULL DEFAULT 10 CHECK (reminder_interval_minutes > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.social_media_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.social_media_urges (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  trigger TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('avoided', 'opened')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_social_media_sessions_user_started
  ON public.social_media_sessions (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_media_urges_user_created
  ON public.social_media_urges (user_id, created_at DESC);

ALTER TABLE public.digital_wellbeing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_urges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their wellbeing profile"
  ON public.digital_wellbeing_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their social sessions"
  ON public.social_media_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their social urges"
  ON public.social_media_urges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.digital_wellbeing_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_media_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_media_urges;
