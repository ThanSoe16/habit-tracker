ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS habit_kind TEXT NOT NULL DEFAULT 'build',
  ADD COLUMN IF NOT EXISTS reminder_snooze_minutes INTEGER NOT NULL DEFAULT 10;

ALTER TABLE public.habits
  DROP CONSTRAINT IF EXISTS habits_habit_kind_check,
  ADD CONSTRAINT habits_habit_kind_check CHECK (habit_kind IN ('build', 'quit')),
  DROP CONSTRAINT IF EXISTS habits_reminder_snooze_minutes_check,
  ADD CONSTRAINT habits_reminder_snooze_minutes_check
    CHECK (reminder_snooze_minutes IN (5, 10, 15, 30));
