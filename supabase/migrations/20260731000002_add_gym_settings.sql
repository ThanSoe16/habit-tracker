-- Migration: 20260731000002_add_gym_settings.sql
-- Add gym_settings JSONB column to user_profiles table

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS gym_settings JSONB DEFAULT '{
  "weightUnit": "kg",
  "restTimerSeconds": 60,
  "autoFinishWorkout": false,
  "showCategoryBadges": true,
  "defaultTargetSets": 4
}'::jsonb;
