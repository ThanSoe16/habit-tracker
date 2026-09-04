CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  action_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.habit_reminder_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
  habit_id TEXT NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  reminder_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  snoozed_until TIMESTAMP WITH TIME ZONE,
  snooze_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (subscription_id, habit_id, reminder_date, scheduled_time)
);

CREATE INDEX IF NOT EXISTS idx_habit_reminder_snoozes
  ON public.habit_reminder_deliveries (snoozed_until)
  WHERE snoozed_until IS NOT NULL AND snooze_sent_at IS NULL;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_reminder_deliveries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.push_subscriptions FROM anon, authenticated;
REVOKE ALL ON public.habit_reminder_deliveries FROM anon, authenticated;
