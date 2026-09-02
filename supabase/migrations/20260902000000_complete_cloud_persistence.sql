-- Persist account, mood, and custom workout preferences that were previously local-only.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS ringtone TEXT DEFAULT 'chime',
  ADD COLUMN IF NOT EXISTS custom_ringtone_url TEXT,
  ADD COLUMN IF NOT EXISTS vibration_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS mood_settings JSONB DEFAULT '{
    "enableNotes": true,
    "showStreak": true
  }'::jsonb;

ALTER TABLE public.gym_custom_exercises
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;

WITH ordered_habits AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) - 1 AS position
  FROM public.habits
)
UPDATE public.habits AS habits
SET sort_order = ordered_habits.position
FROM ordered_habits
WHERE habits.id = ordered_habits.id
  AND habits.sort_order IS NULL;
