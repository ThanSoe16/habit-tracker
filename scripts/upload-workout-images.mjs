import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Read env variables from .env.local or process.env
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envFile.split('\n').forEach((line) => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length > 0) {
    envVars[key.trim()] = vals.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PRESET_EXERCISES = [
  { name: 'Incline Chest Press', category: 'Chest', path: 'public/work-out/chests/incline-chest.png' },
  { name: 'Flat Chest Press', category: 'Chest', path: 'public/work-out/chests/flat-chest.png' },
  { name: 'Barbell Bench Press', category: 'Chest', path: 'public/work-out/chests/incline-chest.png' },
  { name: 'Chest Flyes', category: 'Chest', path: 'public/work-out/chests/chest-flyes.png' },
  { name: 'Standard Push-ups', category: 'Chest', path: 'public/work-out/push-ups/standard-push-up.png' },
  { name: 'Decline Push-ups (Upper Chest)', category: 'Chest', path: 'public/work-out/push-ups/decline-push-up.png' },
  { name: 'Incline Push-ups (Lower Chest)', category: 'Chest', path: 'public/work-out/push-ups/incline-push-up.png' },
  { name: 'Diamond Push-ups (Triceps & Inner Chest)', category: 'Chest', path: 'public/work-out/push-ups/diamond-push-up.png' },
  { name: 'Wide-Grip Push-ups (Outer Chest)', category: 'Chest', path: 'public/work-out/push-ups/wide-grip-push-ups.png' },
  { name: 'Pike Push-ups (Shoulders)', category: 'Shoulders', path: 'public/work-out/push-ups/pike-push-up.png' },
  { name: 'Archer Push-ups (Unilateral Chest)', category: 'Chest', path: 'public/work-out/push-ups/standard-push-up.png' },
  { name: 'Pull-ups / Lat Pulldown', category: 'Back', path: 'public/work-out/back/pull-down.png' },
  { name: 'Barbell Bent-Over Row', category: 'Back', path: 'public/work-out/back/barbell-bent-over-row.png' },
  { name: 'Seated Cable Row', category: 'Back', path: 'public/work-out/back/seated-cable-row.png' },
  { name: 'Single-Arm Dumbbell Row', category: 'Back', path: 'public/work-out/back/single-arm-dumbbell-row.png' },
  { name: 'Barbell Squats', category: 'Legs', path: 'public/work-out/chests/barbell-squats.png' },
  { name: 'Leg Press', category: 'Legs', path: 'public/work-out/legs/leg-press.png' },
  { name: 'Romanian Deadlift', category: 'Legs', path: 'public/work-out/legs/deadlift.png' },
  { name: 'Leg Extension', category: 'Legs', path: 'public/work-out/legs/leg-extension.png' },
  { name: 'Lying Leg Curl', category: 'Legs', path: 'public/work-out/legs/lying-leg-curl.png' },
  { name: 'Calf Raises', category: 'Legs', path: 'public/work-out/legs/calf-raises.png' },
  { name: 'Shoulder Press', category: 'Shoulders', path: 'public/work-out/shoulders/shoulder-press.png' },
  { name: 'Lateral Raises', category: 'Shoulders', path: 'public/work-out/shoulders/lateral-raises.png' },
  { name: 'Front Dumbbell Raise', category: 'Shoulders', path: 'public/work-out/shoulders/front-dumbbell-raise.png' },
  { name: 'Triceps Overhead Extension', category: 'Arms', path: 'public/work-out/triceps/triceps-overhead-extension.png' },
  { name: 'Triceps Pushdown', category: 'Arms', path: 'public/work-out/triceps/triceps-pushdown.png' },
  { name: 'Barbell Bicep Curl', category: 'Arms', path: 'public/work-out/biceps/barbell-bicep-curl.png' },
  { name: 'Dumbbell Hammer Curl', category: 'Arms', path: 'public/work-out/biceps/dumbbell-hammer-curl.png' },
  { name: 'Plank', category: 'Core', path: 'public/work-out/core-abs/plank.png' },
  { name: 'Hanging Leg Raise', category: 'Core', path: 'public/work-out/core-abs/hanging-leg-raise.png' },
  { name: 'Cable Crunch (Upper Abs)', category: 'Core', path: 'public/work-out/core-abs/cable-crunch.png' },
  { name: 'Russian Twists (Obliques)', category: 'Core', path: 'public/work-out/core-abs/russian-twists.png' },
  { name: 'Ab Wheel Rollout', category: 'Core', path: 'public/work-out/core-abs/ab-wheel-rollout.png' },
  { name: 'Mountain Climbers', category: 'Core', path: 'public/work-out/core-abs/mountain-climbers.png' },
  { name: 'Reverse Crunch (Lower Abs)', category: 'Core', path: 'public/work-out/core-abs/reverse-crunch.png' },
  { name: 'Treadmill Running', category: 'Cardio', path: 'public/work-out/core-abs/treadmill-running.png' },
  { name: 'Stationary Cycling', category: 'Cardio', path: 'public/work-out/core-abs/stationary-cycling.png' },
];

async function seedWorkoutImages() {
  console.log('🚀 Starting Supabase Workout Images & Exercises Seeding...');

  // Ensure storage bucket 'workout-images' exists and is public
  try {
    const { data: bucketData, error: bucketErr } = await supabase.storage.createBucket('workout-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    });
    if (bucketErr && !bucketErr.message.includes('already exists')) {
      console.warn('Notice regarding bucket creation:', bucketErr.message);
    } else {
      console.log('📦 Storage bucket "workout-images" ready!');
    }
  } catch (err) {
    console.warn('Bucket check notice:', err);
  }

  for (const item of PRESET_EXERCISES) {
    const fullPath = path.join(process.cwd(), item.path);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ File not found: ${fullPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const fileName = path.basename(item.path);
    const storagePath = `${item.category.toLowerCase()}/${fileName}`;

    console.log(`Uploading ${fileName} to Supabase Storage bucket 'workout-images'...`);
    const { data: storageData, error: uploadErr } = await supabase.storage
      .from('workout-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadErr) {
      console.error(`❌ Upload failed for ${item.name}:`, uploadErr.message);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from('workout-images')
      .getPublicUrl(storageData.path);

    const publicUrl = publicUrlData.publicUrl;
    console.log(`✅ Uploaded to: ${publicUrl}`);

    console.log(`Upserting exercise entry for '${item.name}'...`);
    const { error: dbErr } = await supabase
      .from('workout_exercises')
      .upsert(
        {
          name: item.name,
          category: item.category,
          image_url: publicUrl,
          default_sets: 4,
          default_reps: '8-12',
          is_custom: false,
        },
        { onConflict: 'name' }
      );

    if (dbErr) {
      console.error(`❌ Database upsert failed for ${item.name}:`, dbErr.message);
    } else {
      console.log(`🎉 Successfully saved ${item.name}!`);
    }
  }

  console.log('✨ All workout images uploaded & database entries created in Supabase!');
}

seedWorkoutImages().catch(console.error);
