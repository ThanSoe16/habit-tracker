import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local manually
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znuymeaxcxjsmrafvlht.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase URL or Service Role Key in environment!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const WORKOUT_DIR = path.join(process.cwd(), 'public', 'work-out');

async function convertAndUploadWebp() {
  console.log('🚀 Converting all workout PNG images to compressed WebP format...');

  if (!fs.existsSync(WORKOUT_DIR)) {
    console.error('❌ Workout directory not found:', WORKOUT_DIR);
    return;
  }

  const subdirs = fs.readdirSync(WORKOUT_DIR).filter((f) => {
    return fs.statSync(path.join(WORKOUT_DIR, f)).isDirectory();
  });

  let totalOriginalSize = 0;
  let totalWebpSize = 0;

  for (const categoryDir of subdirs) {
    const categoryPath = path.join(WORKOUT_DIR, categoryDir);
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.png'));

    for (const file of files) {
      const pngPath = path.join(categoryPath, file);
      const webpName = file.replace(/\.png$/, '.webp');
      const webpPath = path.join(categoryPath, webpName);

      const originalSize = fs.statSync(pngPath).size;
      totalOriginalSize += originalSize;

      // 1. Convert PNG to WebP with Sharp (quality: 80)
      await sharp(pngPath)
        .webp({ quality: 80, compressionLevel: 6 })
        .toFile(webpPath);

      const webpSize = fs.statSync(webpPath).size;
      totalWebpSize += webpSize;

      console.log(
        `📸 Converted ${categoryDir}/${file} (${(originalSize / 1024).toFixed(1)} KB) -> ${webpName} (${(
          webpSize / 1024
        ).toFixed(1)} KB, saved ${(((originalSize - webpSize) / originalSize) * 100).toFixed(0)}%)`
      );

      // 2. Upload WebP to Supabase Storage
      const storagePath = `${categoryDir}/${webpName}`;
      const fileBuffer = fs.readFileSync(webpPath);

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('workout-images')
        .upload(storagePath, fileBuffer, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadErr) {
        console.error(`❌ Upload failed for ${storagePath}:`, uploadErr.message);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('workout-images')
        .getPublicUrl(storagePath);

      const webpPublicUrl = publicUrlData.publicUrl;
      console.log(`✅ Uploaded WebP to: ${webpPublicUrl}`);

      // 3. Update database rows matching this category / image name
      const exerciseBaseName = file.replace(/\.png$/, '');
      const { data: existingRows } = await supabase.from('workout_exercises').select('*');

      if (existingRows) {
        const matching = existingRows.filter((r) => {
          const catMatch = r.category.toLowerCase().includes(categoryDir.toLowerCase()) || categoryDir.toLowerCase().includes(r.category.toLowerCase());
          const imgMatch = r.image_url && r.image_url.toLowerCase().includes(exerciseBaseName.toLowerCase());
          return catMatch || imgMatch;
        });

        for (const row of matching) {
          await supabase
            .from('workout_exercises')
            .update({ image_url: webpPublicUrl })
            .eq('id', row.id);
          console.log(`🎉 Updated database entry '${row.name}' -> ${webpPublicUrl}`);
        }
      }
    }
  }

  console.log('\n======================================================');
  console.log(`🎉 WebP Conversion & Upload Completed Successfully!`);
  console.log(`📦 Original Total Size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`⚡ WebP Total Size:     ${(totalWebpSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🔥 Total Savings:       ${(((totalOriginalSize - totalWebpSize) / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log('======================================================\n');
}

convertAndUploadWebp().catch(console.error);
