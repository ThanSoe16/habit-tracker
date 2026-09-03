-- Persist visual customization preferences for the personal dashboard.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS appearance_settings JSONB DEFAULT '{
    "accentColor": "orange",
    "density": "comfortable",
    "reduceMotion": false
  }'::jsonb;
