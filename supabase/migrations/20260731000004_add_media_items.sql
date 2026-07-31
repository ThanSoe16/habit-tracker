-- Migration: 20260731000004_add_media_items.sql
-- Create media_items table for storing voice memos, photos, and video recordings in Media Store

CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  type TEXT NOT NULL CHECK (type IN ('voice', 'photo', 'video')),
  title TEXT NOT NULL,
  data_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT DEFAULT 0,
  duration NUMERIC,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user_id lookups ordered by creation time
CREATE INDEX IF NOT EXISTS idx_media_items_user_created ON public.media_items (user_id, created_at DESC);

-- Enable RLS & create public access policy
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all access on media_items" ON public.media_items FOR ALL USING (true) WITH CHECK (true);

-- Create public storage bucket 'media_store' for files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media_store', 'media_store', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read & upload policies for media_store bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Read Access for media_store'
  ) THEN
    CREATE POLICY "Public Read Access for media_store" ON storage.objects
      FOR SELECT USING (bucket_id = 'media_store');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Upload Access for media_store'
  ) THEN
    CREATE POLICY "Public Upload Access for media_store" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'media_store');
  END IF;
END $$;
