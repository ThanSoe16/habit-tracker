-- Migration: 20260731000003_add_gym_body_metrics.sql
-- Create gym_body_metrics table for tracking historical weight, height, body fat, and fitness goals

CREATE TABLE IF NOT EXISTS public.gym_body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  height_cm NUMERIC,
  weight_kg NUMERIC NOT NULL,
  target_weight_kg NUMERIC,
  body_fat_pct NUMERIC,
  muscle_mass_kg NUMERIC,
  fitness_goal TEXT,
  activity_level TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user_id and logged_at lookups
CREATE INDEX IF NOT EXISTS idx_gym_body_metrics_user_logged ON public.gym_body_metrics (user_id, logged_at DESC);

-- Enable RLS & create public policies
ALTER TABLE public.gym_body_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all access on gym_body_metrics" ON public.gym_body_metrics FOR ALL USING (true) WITH CHECK (true);
