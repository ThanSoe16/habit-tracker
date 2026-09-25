BEGIN;

CREATE TABLE public.goals (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 120),
  why TEXT NOT NULL DEFAULT '' CHECK (length(why) <= 500),
  target_date DATE,
  target_amount NUMERIC CHECK (target_amount > 0 AND target_amount <= 1000000000000 AND scale(target_amount) <= 2),
  currency TEXT NOT NULL CHECK (currency IN ('USDT', 'THB', 'MMK', 'SGD')),
  places TEXT[] NOT NULL DEFAULT '{}',
  sub_ideas JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(sub_ideas) = 'array'),
  savings JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(savings) = 'array'),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'planning', 'in_progress', 'completed')),
  completion_note TEXT NOT NULL DEFAULT '' CHECK (length(completion_note) <= 800),
  energy_score SMALLINT CHECK (energy_score BETWEEN 1 AND 5),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX goals_user_updated_idx ON public.goals (user_id, updated_at DESC, id DESC);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.goals FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.goals TO authenticated;
GRANT INSERT (id, title, why, target_date, target_amount, currency, places, sub_ideas, savings, status, completion_note, energy_score, completed_at, created_at, updated_at)
  ON public.goals TO authenticated;
GRANT UPDATE (title, why, target_date, target_amount, currency, places, sub_ideas, savings, status, completion_note, energy_score, completed_at, updated_at)
  ON public.goals TO authenticated;

CREATE POLICY goals_select_own ON public.goals FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY goals_insert_own ON public.goals FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY goals_update_own ON public.goals FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY goals_delete_own ON public.goals FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE TABLE public.goal_settings (
  user_id UUID PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  show_completed_on_home BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.goal_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.goal_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.goal_settings TO authenticated;
GRANT INSERT (show_completed_on_home) ON public.goal_settings TO authenticated;
GRANT UPDATE (show_completed_on_home) ON public.goal_settings TO authenticated;

CREATE POLICY goal_settings_select_own ON public.goal_settings FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY goal_settings_insert_own ON public.goal_settings FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY goal_settings_update_own ON public.goal_settings FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

ALTER TABLE public.goals REPLICA IDENTITY FULL;
ALTER TABLE public.goal_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals, public.goal_settings;

COMMIT;
