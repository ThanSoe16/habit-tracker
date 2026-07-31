-- Migration: 20260731000001_add_home_settings.sql
-- Add home_settings JSONB column to user_profiles table

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS home_settings JSONB DEFAULT '{
  "homeDefaultView": "today",
  "cardStyle": "detailed",
  "hideCompleted": false,
  "sortBy": "manual",
  "groupByTimeOfDay": false,
  "showProgressBanner": true,
  "showStreakBadges": true
}'::jsonb;
