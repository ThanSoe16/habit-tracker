-- Migration: 20260731000005_add_storage_policies.sql
-- Enable public SELECT, INSERT, UPDATE, and DELETE policies for media_store bucket in storage.objects

UPDATE storage.buckets SET public = true WHERE id = 'media_store';

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Read Access for media_store" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access for media_store" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access for media_store" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access for media_store" ON storage.objects;

-- Create policies for media_store bucket
CREATE POLICY "Public Read Access for media_store" ON storage.objects
  FOR SELECT USING (bucket_id = 'media_store');

CREATE POLICY "Public Upload Access for media_store" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media_store');

CREATE POLICY "Public Update Access for media_store" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media_store');

CREATE POLICY "Public Delete Access for media_store" ON storage.objects
  FOR DELETE USING (bucket_id = 'media_store');
