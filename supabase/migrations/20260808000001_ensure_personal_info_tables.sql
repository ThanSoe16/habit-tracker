-- Migration: 20260808000001_ensure_personal_info_tables.sql
-- Ensure both Current Personal Info and Personal Info History tables are complete

-- 1. Table: gym_body_metrics (History Table for personal info snapshots over time)
CREATE TABLE IF NOT EXISTS public.gym_body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  height_cm NUMERIC,
  weight_kg NUMERIC NOT NULL,
  target_weight_kg NUMERIC,
  dob DATE,
  gender TEXT,
  body_fat_pct NUMERIC,
  muscle_mass_kg NUMERIC,
  fitness_goal TEXT,
  activity_level TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure dob and gender columns exist in gym_body_metrics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_body_metrics' AND column_name = 'dob') THEN
    ALTER TABLE public.gym_body_metrics ADD COLUMN dob DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_body_metrics' AND column_name = 'gender') THEN
    ALTER TABLE public.gym_body_metrics ADD COLUMN gender TEXT;
  END IF;
END $$;

-- Index for fast history queries
CREATE INDEX IF NOT EXISTS idx_gym_body_metrics_user_logged ON public.gym_body_metrics (user_id, logged_at DESC);

-- Enable RLS & policies on gym_body_metrics
ALTER TABLE public.gym_body_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on gym_body_metrics" ON public.gym_body_metrics;
CREATE POLICY "Allow public all access on gym_body_metrics" ON public.gym_body_metrics FOR ALL USING (true) WITH CHECK (true);

-- 2. Ensure user_profiles table exists for Current Personal Info (gym_settings)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY DEFAULT 'default_user',
  gym_settings JSONB DEFAULT '{}'::jsonb,
  budget_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on user_profiles" ON public.user_profiles;
CREATE POLICY "Allow public all access on user_profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
