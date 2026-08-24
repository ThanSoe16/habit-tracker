const LOCAL_IMAGE_BASE_URL = '/work-out';

export const EXERCISE_IMAGES_MAP: Record<string, string> = {
  // Chest
  'Incline Chest Press': `${LOCAL_IMAGE_BASE_URL}/chests/incline-chest.png`,
  'Flat Chest Press': `${LOCAL_IMAGE_BASE_URL}/chests/flat-chest.png`,
  'Barbell Bench Press': `${LOCAL_IMAGE_BASE_URL}/chests/incline-chest.png`,
  'Chest Flyes': `${LOCAL_IMAGE_BASE_URL}/chests/chest-flyes.png`,

  // Push-ups
  'Push-ups': `${LOCAL_IMAGE_BASE_URL}/push-ups/standard-push-up.png`,
  'Standard Push-ups': `${LOCAL_IMAGE_BASE_URL}/push-ups/standard-push-up.png`,
  'Decline Push-ups (Upper Chest)': `${LOCAL_IMAGE_BASE_URL}/push-ups/decline-push-up.png`,
  'Incline Push-ups (Lower Chest)': `${LOCAL_IMAGE_BASE_URL}/push-ups/incline-push-up.png`,
  'Diamond Push-ups (Triceps & Inner Chest)': `${LOCAL_IMAGE_BASE_URL}/push-ups/diamond-push-up.png`,
  'Wide-Grip Push-ups (Outer Chest)': `${LOCAL_IMAGE_BASE_URL}/push-ups/wide-grip-push-ups.png`,
  'Pike Push-ups (Shoulders)': `${LOCAL_IMAGE_BASE_URL}/push-ups/pike-push-up.png`,
  'Archer Push-ups (Unilateral Chest)': `${LOCAL_IMAGE_BASE_URL}/push-ups/standard-push-up.png`,

  // Back
  'Pull-ups / Lat Pulldown': `${LOCAL_IMAGE_BASE_URL}/back/pull-down.png`,
  'Vertical Pull (Lat Pulldown)': `${LOCAL_IMAGE_BASE_URL}/back/pull-down.png`,
  'Barbell Bent-Over Row': `${LOCAL_IMAGE_BASE_URL}/back/barbell-bent-over-row.png`,
  'Horizontal Pull (Seated Row)': `${LOCAL_IMAGE_BASE_URL}/back/seated-cable-row.png`,
  'Seated Cable Row': `${LOCAL_IMAGE_BASE_URL}/back/seated-cable-row.png`,
  'Horizontal Pull (Chest-Supported Row)': `${LOCAL_IMAGE_BASE_URL}/back/barbell-bent-over-row.png`,
  'Single-Arm Dumbbell Row': `${LOCAL_IMAGE_BASE_URL}/back/single-arm-dumbbell-row.png`,

  // Legs
  'Barbell Squats': `${LOCAL_IMAGE_BASE_URL}/chests/barbell-squats.png`,
  'Squat Pattern (Barbell Squat)': `${LOCAL_IMAGE_BASE_URL}/chests/barbell-squats.png`,
  'Leg Press': `${LOCAL_IMAGE_BASE_URL}/legs/leg-press.png`,
  'Romanian Deadlift': `${LOCAL_IMAGE_BASE_URL}/legs/deadlift.png`,
  'RDL (Romanian Deadlift)': `${LOCAL_IMAGE_BASE_URL}/legs/deadlift.png`,
  'Leg Extension': `${LOCAL_IMAGE_BASE_URL}/legs/leg-extension.png`,
  'Lying Leg Curl': `${LOCAL_IMAGE_BASE_URL}/legs/lying-leg-curl.png`,
  'Leg Curl': `${LOCAL_IMAGE_BASE_URL}/legs/lying-leg-curl.png`,
  'Hamstring Curl': `${LOCAL_IMAGE_BASE_URL}/legs/lying-leg-curl.png`,
  'Calf Raises': `${LOCAL_IMAGE_BASE_URL}/legs/calf-raises.png`,
  'Split Squat (Bulgarian / Dumbbell)': `${LOCAL_IMAGE_BASE_URL}/legs/bulgarian-split-squat.png`,

  // Shoulders
  'Shoulder Press': `${LOCAL_IMAGE_BASE_URL}/shoulders/shoulder-press.png`,
  'Lateral Raises': `${LOCAL_IMAGE_BASE_URL}/shoulders/lateral-raises.png`,
  'Face Pulls': `${LOCAL_IMAGE_BASE_URL}/back/face-pulls.png`,
  'Rear Delt Flyes / Reverse Fly': `${LOCAL_IMAGE_BASE_URL}/back/face-pulls.png`,
  'Front Dumbbell Raise': `${LOCAL_IMAGE_BASE_URL}/shoulders/front-dumbbell-raise.png`,

  // Arms
  'Triceps Overhead Extension': `${LOCAL_IMAGE_BASE_URL}/triceps/triceps-overhead-extension.png`,
  'Triceps Pushdown': `${LOCAL_IMAGE_BASE_URL}/triceps/triceps-pushdown.png`,
  'Barbell Bicep Curl': `${LOCAL_IMAGE_BASE_URL}/biceps/barbell-bicep-curl.png`,
  'Preacher Bicep Curl': `${LOCAL_IMAGE_BASE_URL}/biceps/barbell-bicep-curl.png`,
  'Dumbbell Hammer Curl': `${LOCAL_IMAGE_BASE_URL}/biceps/dumbbell-hammer-curl.png`,
  'Incline Dumbbell Bicep Curl': `${LOCAL_IMAGE_BASE_URL}/biceps/dumbbell-hammer-curl.png`,

  // Core / Abs
  Plank: `${LOCAL_IMAGE_BASE_URL}/core-abs/plank.png`,
  'Hanging Leg Raise': `${LOCAL_IMAGE_BASE_URL}/core-abs/hanging-leg-raise.png`,
  'Cable Crunch (Upper Abs)': `${LOCAL_IMAGE_BASE_URL}/core-abs/cable-crunch.png`,
  'Russian Twists (Obliques)': `${LOCAL_IMAGE_BASE_URL}/core-abs/russian-twists.png`,
  'Bicycle Crunches': `${LOCAL_IMAGE_BASE_URL}/core-abs/russian-twists.png`,
  'Ab Wheel Rollout': `${LOCAL_IMAGE_BASE_URL}/core-abs/ab-wheel-rollout.png`,
  'Mountain Climbers': `${LOCAL_IMAGE_BASE_URL}/core-abs/mountain-climbers.png`,
  'Side Plank (Obliques)': `${LOCAL_IMAGE_BASE_URL}/core-abs/plank.png`,
  'Reverse Crunch (Lower Abs)': `${LOCAL_IMAGE_BASE_URL}/core-abs/reverse-crunch.png`,

  // Cardio
  'Treadmill Running': `${LOCAL_IMAGE_BASE_URL}/core-abs/treadmill-running.png`,
  'Stationary Cycling': `${LOCAL_IMAGE_BASE_URL}/core-abs/stationary-cycling.png`,
};

export function getExerciseImage(
  exerciseName: string,
  customImageUrl?: string | null,
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

  if (lower.includes('chest') || lower.includes('press'))
    return `${LOCAL_IMAGE_BASE_URL}/chests/flat-chest.png`;
  if (lower.includes('push')) return `${LOCAL_IMAGE_BASE_URL}/push-ups/standard-push-up.png`;
  if (lower.includes('pull') || lower.includes('row'))
    return `${LOCAL_IMAGE_BASE_URL}/back/pull-down.png`;
  if (lower.includes('squat') || lower.includes('leg'))
    return `${LOCAL_IMAGE_BASE_URL}/legs/leg-press.png`;
  if (lower.includes('shoulder') || lower.includes('delt'))
    return `${LOCAL_IMAGE_BASE_URL}/shoulders/shoulder-press.png`;
  if (lower.includes('bicep') || lower.includes('curl'))
    return `${LOCAL_IMAGE_BASE_URL}/biceps/barbell-bicep-curl.png`;
  if (lower.includes('tricep')) return `${LOCAL_IMAGE_BASE_URL}/triceps/triceps-pushdown.png`;
  if (lower.includes('ab') || lower.includes('crunch') || lower.includes('plank'))
    return `${LOCAL_IMAGE_BASE_URL}/core-abs/plank.png`;

  return null;
}
