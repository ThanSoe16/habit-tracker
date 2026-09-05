-- Preserve optional reflection notes independently of the feeling tag.
ALTER TABLE public.mood_entries ADD COLUMN IF NOT EXISTS note TEXT;
