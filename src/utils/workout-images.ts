const STORAGE_BASE_URL = 'https://znuymeaxcxjsmrafvlht.supabase.co/storage/v1/object/public/workout-images';

export const EXERCISE_IMAGES_MAP: Record<string, string> = {
  // Chest
  'Incline Chest Press': `${STORAGE_BASE_URL}/chests/incline-chest.webp`,
  'Flat Chest Press': `${STORAGE_BASE_URL}/chests/flat-chest.webp`,
  'Barbell Bench Press': `${STORAGE_BASE_URL}/chests/incline-chest.webp`,
  'Chest Flyes': `${STORAGE_BASE_URL}/chests/chest-flyes.webp`,

  // Push-ups
  'Push-ups': `${STORAGE_BASE_URL}/push-ups/standard-push-up.webp`,
  'Standard Push-ups': `${STORAGE_BASE_URL}/push-ups/standard-push-up.webp`,
  'Decline Push-ups (Upper Chest)': `${STORAGE_BASE_URL}/push-ups/decline-push-up.webp`,
  'Incline Push-ups (Lower Chest)': `${STORAGE_BASE_URL}/push-ups/incline-push-up.webp`,
  'Diamond Push-ups (Triceps & Inner Chest)': `${STORAGE_BASE_URL}/push-ups/diamond-push-up.webp`,
  'Wide-Grip Push-ups (Outer Chest)': `${STORAGE_BASE_URL}/push-ups/wide-grip-push-ups.webp`,
  'Pike Push-ups (Shoulders)': `${STORAGE_BASE_URL}/push-ups/pike-push-up.webp`,
  'Archer Push-ups (Unilateral Chest)': `${STORAGE_BASE_URL}/push-ups/standard-push-up.webp`,

  // Back
  'Pull-ups / Lat Pulldown': `${STORAGE_BASE_URL}/back/pull-down.webp`,
  'Vertical Pull (Lat Pulldown)': `${STORAGE_BASE_URL}/back/pull-down.webp`,
  'Barbell Bent-Over Row': `${STORAGE_BASE_URL}/back/barbell-bent-over-row.webp`,
  'Horizontal Pull (Seated Row)': `${STORAGE_BASE_URL}/back/seated-cable-row.webp`,
  'Seated Cable Row': `${STORAGE_BASE_URL}/back/seated-cable-row.webp`,
  'Horizontal Pull (Chest-Supported Row)': `${STORAGE_BASE_URL}/back/barbell-bent-over-row.webp`,
  'Single-Arm Dumbbell Row': `${STORAGE_BASE_URL}/back/single-arm-dumbbell-row.webp`,

  // Legs
  'Barbell Squats': `${STORAGE_BASE_URL}/legs/barbell-squats.webp`,
  'Squat Pattern (Barbell Squat)': `${STORAGE_BASE_URL}/legs/barbell-squats.webp`,
  'Leg Press': `${STORAGE_BASE_URL}/legs/leg-press.webp`,
  'Romanian Deadlift': `${STORAGE_BASE_URL}/legs/deadlift.webp`,
  'RDL (Romanian Deadlift)': `${STORAGE_BASE_URL}/legs/deadlift.webp`,
  'Leg Extension': `${STORAGE_BASE_URL}/legs/leg-extension.webp`,
  'Lying Leg Curl': `${STORAGE_BASE_URL}/legs/lying-leg-curl.webp`,
  'Leg Curl': `${STORAGE_BASE_URL}/legs/lying-leg-curl.webp`,
  'Hamstring Curl': `${STORAGE_BASE_URL}/legs/lying-leg-curl.webp`,
  'Calf Raises': `${STORAGE_BASE_URL}/legs/calf-raises.webp`,
  'Split Squat (Bulgarian / Dumbbell)': `${STORAGE_BASE_URL}/legs/bulgarian-split-squat.webp`,

  // Shoulders
  'Shoulder Press': `${STORAGE_BASE_URL}/shoulders/shoulder-press.webp`,
  'Lateral Raises': `${STORAGE_BASE_URL}/shoulders/lateral-raises.webp`,
  'Face Pulls': `${STORAGE_BASE_URL}/back/face-pulls.webp`,
  'Rear Delt Flyes / Reverse Fly': `${STORAGE_BASE_URL}/back/face-pulls.webp`,
  'Front Dumbbell Raise': `${STORAGE_BASE_URL}/shoulders/front-dumbbell-raise.webp`,

  // Arms
  'Triceps Overhead Extension': `${STORAGE_BASE_URL}/triceps/triceps-overhead-extension.webp`,
  'Triceps Pushdown': `${STORAGE_BASE_URL}/triceps/triceps-pushdown.webp`,
  'Barbell Bicep Curl': `${STORAGE_BASE_URL}/biceps/barbell-bicep-curl.webp`,
  'Preacher Bicep Curl': `${STORAGE_BASE_URL}/biceps/barbell-bicep-curl.webp`,
  'Dumbbell Hammer Curl': `${STORAGE_BASE_URL}/biceps/dumbbell-hammer-curl.webp`,
  'Incline Dumbbell Bicep Curl': `${STORAGE_BASE_URL}/biceps/dumbbell-hammer-curl.webp`,

  // Core / Abs
  'Plank': `${STORAGE_BASE_URL}/core-abs/plank.webp`,
  'Hanging Leg Raise': `${STORAGE_BASE_URL}/core-abs/hanging-leg-raise.webp`,
  'Cable Crunch (Upper Abs)': `${STORAGE_BASE_URL}/core-abs/cable-crunch.webp`,
  'Russian Twists (Obliques)': `${STORAGE_BASE_URL}/core-abs/russian-twists.webp`,
  'Bicycle Crunches': `${STORAGE_BASE_URL}/core-abs/russian-twists.webp`,
  'Ab Wheel Rollout': `${STORAGE_BASE_URL}/core-abs/ab-wheel-rollout.webp`,
  'Mountain Climbers': `${STORAGE_BASE_URL}/core-abs/mountain-climbers.webp`,
  'Side Plank (Obliques)': `${STORAGE_BASE_URL}/core-abs/plank.webp`,
  'Reverse Crunch (Lower Abs)': `${STORAGE_BASE_URL}/core-abs/reverse-crunch.webp`,

  // Cardio
  'Treadmill Running': `${STORAGE_BASE_URL}/core-abs/treadmill-running.webp`,
  'Stationary Cycling': `${STORAGE_BASE_URL}/core-abs/stationary-cycling.webp`,
};

export function getExerciseImage(
  exerciseName: string,
  customImageUrl?: string | null
): string | null {
  if (customImageUrl && customImageUrl.trim().length > 0) {
    return customImageUrl.trim();
  }

  if (!exerciseName) return null;
  const trimmed = exerciseName.trim();
  if (EXERCISE_IMAGES_MAP[trimmed]) {
    return EXERCISE_IMAGES_MAP[trimmed];
  }

  // Fuzzy match fallback
  const lower = trimmed.toLowerCase();
  for (const [key, value] of Object.entries(EXERCISE_IMAGES_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return value;
    }
  }

  if (lower.includes('chest') || lower.includes('press')) return `${STORAGE_BASE_URL}/chests/flat-chest.webp`;
  if (lower.includes('push')) return `${STORAGE_BASE_URL}/push-ups/standard-push-up.webp`;
  if (lower.includes('pull') || lower.includes('row')) return `${STORAGE_BASE_URL}/back/pull-down.webp`;
  if (lower.includes('squat') || lower.includes('leg')) return `${STORAGE_BASE_URL}/legs/leg-press.webp`;
  if (lower.includes('shoulder') || lower.includes('delt')) return `${STORAGE_BASE_URL}/shoulders/shoulder-press.webp`;
  if (lower.includes('bicep') || lower.includes('curl')) return `${STORAGE_BASE_URL}/biceps/barbell-bicep-curl.webp`;
  if (lower.includes('tricep')) return `${STORAGE_BASE_URL}/triceps/triceps-pushdown.webp`;
  if (lower.includes('ab') || lower.includes('crunch') || lower.includes('plank')) return `${STORAGE_BASE_URL}/core-abs/plank.webp`;

  return null;
}
