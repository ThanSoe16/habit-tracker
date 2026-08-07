-- =========================================================================
-- SUPABASE MIGRATION: workout_exercises TABLE & workout-images BUCKET
-- =========================================================================

-- 1. Create workout_exercises table
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Other',
  image_url TEXT,
  default_sets INTEGER DEFAULT 4,
  default_reps TEXT DEFAULT '8-12',
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access on workout_exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Allow public write access on workout_exercises" ON public.workout_exercises;

-- Create policies for public access
CREATE POLICY "Allow public read access on workout_exercises"
  ON public.workout_exercises FOR SELECT
  USING (true);

CREATE POLICY "Allow public write access on workout_exercises"
  ON public.workout_exercises FOR ALL
  USING (true);


-- 2. Create Supabase Storage Bucket for Workout Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('workout-images', 'workout-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Public Read Access for workout-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access for workout-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access for workout-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access for workout-images" ON storage.objects;

-- Create policies for public storage operations
CREATE POLICY "Public Read Access for workout-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'workout-images');

CREATE POLICY "Public Insert Access for workout-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'workout-images');

CREATE POLICY "Public Update Access for workout-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'workout-images');

CREATE POLICY "Public Delete Access for workout-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'workout-images');
