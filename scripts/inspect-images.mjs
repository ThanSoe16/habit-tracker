import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local
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
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function listStorageAndDb() {
  const folders = ['chests', 'back', 'legs', 'shoulders', 'arms', 'core-abs', 'push-ups', 'cardio'];
  
  console.log('=== SUPABASE STORAGE FILES ===');
  for (const f of folders) {
    const { data: files } = await supabase.storage.from('workout-images').list(f);
    console.log(`Folder: ${f}`, files?.map(x => x.name));
  }

  console.log('\n=== CURRENT DB ROWS in workout_exercises ===');
  const { data: rows } = await supabase.from('workout_exercises').select('id, name, category, image_url').order('name');
  for (const r of rows || []) {
    console.log(`- ${r.name} (${r.category}) -> ${r.image_url}`);
  }
}

listStorageAndDb().catch(console.error);
