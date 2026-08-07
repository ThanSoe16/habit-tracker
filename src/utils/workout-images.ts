export const EXERCISE_IMAGES_MAP: Record<string, string> = {
  // Chest
  'Incline Chest Press': '/work-out/chests/incline-chest.png',
  'Flat Chest Press': '/work-out/chests/flat-chest.png',
  'Barbell Bench Press': '/work-out/chests/incline-chest.png',
  'Chest Flyes': '/work-out/chests/chest-flyes.png',

  // Push-ups
  'Push-ups': '/work-out/push-ups/standard-push-up.png',
  'Standard Push-ups': '/work-out/push-ups/standard-push-up.png',
  'Decline Push-ups (Upper Chest)': '/work-out/push-ups/decline-push-up.png',
  'Incline Push-ups (Lower Chest)': '/work-out/push-ups/incline-push-up.png',
  'Diamond Push-ups (Triceps & Inner Chest)': '/work-out/push-ups/diamond-push-up.png',
  'Wide-Grip Push-ups (Outer Chest)': '/work-out/push-ups/wide-grip-push-ups.png',
  'Pike Push-ups (Shoulders)': '/work-out/push-ups/pike-push-up.png',
  'Archer Push-ups (Unilateral Chest)': '/work-out/push-ups/standard-push-up.png',

  // Back
  'Pull-ups / Lat Pulldown': '/work-out/back/pull-down.png',
  'Vertical Pull (Lat Pulldown)': '/work-out/back/pull-down.png',
  'Barbell Bent-Over Row': '/work-out/back/barbell-bent-over-row.png',
  'Horizontal Pull (Seated Row)': '/work-out/back/seated-cable-row.png',
  'Seated Cable Row': '/work-out/back/seated-cable-row.png',
  'Horizontal Pull (Chest-Supported Row)': '/work-out/back/barbell-bent-over-row.png',
  'Single-Arm Dumbbell Row': '/work-out/back/single-arm-dumbbell-row.png',

  // Legs
  'Barbell Squats': '/work-out/chests/barbell-squats.png',
  'Squat Pattern (Barbell Squat)': '/work-out/chests/barbell-squats.png',
  'Leg Press': '/work-out/legs/leg-press.png',
  'Romanian Deadlift': '/work-out/legs/deadlift.png',
  'RDL (Romanian Deadlift)': '/work-out/legs/deadlift.png',
  'Leg Extension': '/work-out/legs/leg-extension.png',
  'Lying Leg Curl': '/work-out/legs/lying-leg-curl.png',
  'Leg Curl': '/work-out/legs/lying-leg-curl.png',
  'Hamstring Curl': '/work-out/legs/lying-leg-curl.png',
  'Calf Raises': '/work-out/legs/calf-raises.png',
  'Split Squat (Bulgarian / Dumbbell)': '/work-out/legs/bulgarian-split-squat.png',

  // Shoulders
  'Shoulder Press': '/work-out/shoulders/shoulder-press.png',
  'Lateral Raises': '/work-out/shoulders/lateral-raises.png',
  'Face Pulls': '/work-out/back/face-pulls.png',
  'Rear Delt Flyes / Reverse Fly': '/work-out/back/face-pulls.png',
  'Front Dumbbell Raise': '/work-out/shoulders/front-dumbbell-raise.png',

  // Arms
  'Triceps Overhead Extension': '/work-out/triceps/triceps-overhead-extension.png',
  'Triceps Pushdown': '/work-out/triceps/triceps-pushdown.png',
  'Barbell Bicep Curl': '/work-out/biceps/barbell-bicep-curl.png',
  'Preacher Bicep Curl': '/work-out/biceps/barbell-bicep-curl.png',
  'Dumbbell Hammer Curl': '/work-out/biceps/dumbbell-hammer-curl.png',
  'Incline Dumbbell Bicep Curl': '/work-out/biceps/dumbbell-hammer-curl.png',

  // Core / Abs
  'Plank': '/work-out/core-abs/plank.png',
  'Hanging Leg Raise': '/work-out/core-abs/hanging-leg-raise.png',
  'Cable Crunch (Upper Abs)': '/work-out/core-abs/cable-crunch.png',
  'Russian Twists (Obliques)': '/work-out/core-abs/russian-twists.png',
  'Bicycle Crunches': '/work-out/core-abs/russian-twists.png',
  'Ab Wheel Rollout': '/work-out/core-abs/ab-wheel-rollout.png',
  'Mountain Climbers': '/work-out/core-abs/mountain-climbers.png',
  'Side Plank (Obliques)': '/work-out/core-abs/plank.png',
  'Reverse Crunch (Lower Abs)': '/work-out/core-abs/reverse-crunch.png',

  // Cardio
  'Treadmill Running': '/work-out/core-abs/treadmill-running.png',
  'Stationary Cycling': '/work-out/core-abs/stationary-cycling.png',
};

export function getExerciseImage(exerciseName: string): string | null {
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

  if (lower.includes('chest') || lower.includes('press')) return '/work-out/chests/flat-chest.png';
  if (lower.includes('push')) return '/work-out/push-ups/standard-push-up.png';
  if (lower.includes('pull') || lower.includes('row')) return '/work-out/back/pull-down.png';
  if (lower.includes('squat') || lower.includes('leg')) return '/work-out/legs/leg-press.png';
  if (lower.includes('shoulder') || lower.includes('delt')) return '/work-out/shoulders/shoulder-press.png';
  if (lower.includes('bicep') || lower.includes('curl')) return '/work-out/biceps/barbell-bicep-curl.png';
  if (lower.includes('tricep')) return '/work-out/triceps/triceps-pushdown.png';
  if (lower.includes('ab') || lower.includes('crunch') || lower.includes('plank')) return '/work-out/core-abs/plank.png';

  return null;
}
