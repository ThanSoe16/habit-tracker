export interface ExerciseGuide {
  name: string;
  category: string;
  targetMuscles: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  steps: string[];
  proTips: string[];
}

export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  'Incline Chest Press': {
    name: 'Incline Chest Press',
    category: 'Chest',
    targetMuscles: ['Upper Chest', 'Front Shoulders', 'Triceps'],
    equipment: 'Dumbbells or Barbell + Incline Bench (30-45°)',
    difficulty: 'Beginner',
    summary: 'Targets the upper pectorals to build upper chest thickness and upper body pressing power.',
    steps: [
      'Set bench to a 30 to 45 degree incline angle.',
      'Sit firmly against backrest holding dumbbells at upper chest level with palms facing forward.',
      'Press weights straight upward over your chest until arms are fully extended.',
      'Pause for a second at top, then lower weights with control back down to chest height.',
    ],
    proTips: [
      'Keep shoulder blades pinched back and down against the bench throughout.',
      'Don’t flare elbows out at a 90° angle; keep them tucked at around 45° to protect shoulders.',
    ],
  },
  'Flat Chest Press': {
    name: 'Flat Chest Press',
    category: 'Chest',
    targetMuscles: ['Middle Chest', 'Triceps', 'Shoulders'],
    equipment: 'Dumbbells or Barbell + Flat Bench',
    difficulty: 'Beginner',
    summary: 'The classic chest builder for total pectoral size and horizontal pressing strength.',
    steps: [
      'Lie flat on bench with feet planted firmly on the floor.',
      'Hold dumbbells at chest sides with palms facing towards feet.',
      'Press weights straight up over center of chest until arms extend.',
      'Lower weights smoothly down until dumbbells lightly touch chest level.',
    ],
    proTips: [
      'Plant feet flat on the floor for maximal stability and drive.',
      'Control the lowering phase (eccentric) for 2 to 3 seconds for maximum muscle engagement.',
    ],
  },
  'Barbell Bench Press': {
    name: 'Barbell Bench Press',
    category: 'Chest',
    targetMuscles: ['Pectorals', 'Anterior Deltoids', 'Triceps Brachii'],
    equipment: 'Barbell & Flat Bench Rack',
    difficulty: 'Intermediate',
    summary: 'The primary compound pressing exercise for developing upper body pushing force.',
    steps: [
      'Unrack barbell with grip slightly wider than shoulder width.',
      'Lower bar in controlled arc down to mid-chest/sternum.',
      'Touch chest lightly without bouncing bar.',
      'Drive bar back up along slight diagonal path until arms lock out overhead.',
    ],
    proTips: [
      'Maintain arch in upper back while driving feet firmly into the floor.',
      'Grip the bar tightly to engage forearms and stabilize wrists.',
    ],
  },
  'Vertical Pull (Lat Pulldown)': {
    name: 'Vertical Pull (Lat Pulldown)',
    category: 'Back',
    targetMuscles: ['Lats (Latissimus Dorsi)', 'Biceps', 'Upper Back'],
    equipment: 'Lat Pulldown Machine or Cable Tower',
    difficulty: 'Beginner',
    summary: 'Develops back width (V-taper) by pulling resistance vertically down towards upper chest.',
    steps: [
      'Sit at pulldown machine and adjust thigh pads firmly.',
      'Grip wide bar slightly wider than shoulder width with palms facing forward.',
      'Lean back slightly (10-15°), pull bar down smoothly towards upper chest/collarbone.',
      'Squeeze shoulder blades together at bottom, then slowly let bar ascend up.',
    ],
    proTips: [
      'Pull through your elbows rather than pulling with your hands/forearms.',
      'Never pull bar behind neck as it stresses cervical spine and rotator cuff.',
    ],
  },
  'Pull-ups / Lat Pulldown': {
    name: 'Pull-ups / Lat Pulldown',
    category: 'Back',
    targetMuscles: ['Lats', 'Rhomboids', 'Biceps'],
    equipment: 'Pull-Up Bar or Lat Pulldown Station',
    difficulty: 'Intermediate',
    summary: 'Gold standard bodyweight pulling exercise for building back width and grip strength.',
    steps: [
      'Hang from bar with overhand grip slightly wider than shoulder width.',
      'Initiate pull by depressing shoulder blades down.',
      'Pull body up until chin clears above bar level.',
      'Lower body smoothly to dead hang position under control.',
    ],
    proTips: [
      'Keep core engaged and avoid swinging legs for momentum.',
    ],
  },
  'Barbell Bent-Over Row': {
    name: 'Barbell Bent-Over Row',
    category: 'Back',
    targetMuscles: ['Lats', 'Rhomboids', 'Lower Back', 'Biceps'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    summary: 'Builds thick, powerful mid-back musculature and posterior chain stability.',
    steps: [
      'Stand feet hip-width apart holding barbell with overhand grip.',
      'Hinge at hips to lower torso to roughly 45 degrees, keeping back flat.',
      'Pull barbell up to lower ribs/navel, squeezing back at top.',
      'Lower barbell back down until arms stretch fully.',
    ],
    proTips: [
      'Keep spine neutral (do not round lower back).',
    ],
  },
  'Seated Cable Row': {
    name: 'Seated Cable Row',
    category: 'Back',
    targetMuscles: ['Middle Back', 'Lats', 'Rear Delts', 'Biceps'],
    equipment: 'Seated Row Machine or Low Cable Pulley',
    difficulty: 'Beginner',
    summary: 'Targets mid-back thickness with constant cable tension throughout movement.',
    steps: [
      'Sit on bench with knees slightly bent, feet braced on footrests.',
      'Grip handle, sit upright with chest tall and arms extended.',
      'Pull handle towards abdomen while driving elbows back.',
      'Squeeze shoulder blades for 1 second, then stretch forward slowly.',
    ],
    proTips: [
      'Avoid excessive rocking backward and forward; isolate your back muscles.',
    ],
  },
  'Shoulder Press': {
    name: 'Shoulder Press',
    category: 'Shoulders',
    targetMuscles: ['Deltoids (Front & Side)', 'Triceps', 'Upper Chest'],
    equipment: 'Dumbbells, Barbell, or Machine',
    difficulty: 'Beginner',
    summary: 'Overhead pressing movement for building broad, strong, rounded shoulder muscles.',
    steps: [
      'Sit or stand tall with dumbbells held at shoulder level, palms forward or neutral.',
      'Press weights overhead in smooth arc until arms lock out above head.',
      'Pause briefly, then lower dumbbells under control back to shoulder level.',
    ],
    proTips: [
      'Brace core firmly so you don’t arch lower back excessively.',
    ],
  },
  'Lateral Raises': {
    name: 'Lateral Raises',
    category: 'Shoulders',
    targetMuscles: ['Side Deltoids (Lateral Head)'],
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    summary: 'Isolates the side head of deltoids to create wider 3D shoulder width.',
    steps: [
      'Stand holding dumbbells at your sides with palms facing inward.',
      'Keep slight bend in elbows, raise arms out to sides until parallel with floor.',
      'Pause 1 second at shoulder height, then lower weights back down smoothly.',
    ],
    proTips: [
      'Think of pushing weights out towards walls rather than lifting them up.',
      'Don’t use heavy momentum or shrug shoulders upwards.',
    ],
  },
  'Rear Delt Flyes / Reverse Fly': {
    name: 'Rear Delt Flyes / Reverse Fly',
    category: 'Shoulders',
    targetMuscles: ['Rear Deltoids', 'Upper Back'],
    equipment: 'Dumbbells or Peck Deck Machine',
    difficulty: 'Beginner',
    summary: 'Isolates back of shoulder to improve posture and shoulder joint stability.',
    steps: [
      'Hinge forward at hips or sit on chest-supported bench.',
      'With slight bend in elbows, raise dumbbells out to sides squeezing rear delts.',
      'Lower weights smoothly down together.',
    ],
    proTips: [
      'Focus on pulling with back of shoulders, not squeezing shoulder blades completely.',
    ],
  },
  'Preacher Bicep Curl': {
    name: 'Preacher Bicep Curl',
    category: 'Arms',
    targetMuscles: ['Biceps (Short Head)', 'Brachialis'],
    equipment: 'Preacher Bench + EZ Bar or Dumbbells',
    difficulty: 'Beginner',
    summary: 'Eliminates body momentum to strictly isolate and peak bicep muscles.',
    steps: [
      'Sit at preacher bench, resting upper arms securely against arm pad.',
      'Grip bar with underhand grip and lower bar down until arms are nearly straight.',
      'Curl bar upward toward shoulders, squeezing biceps hard at top peak.',
      'Lower weight slowly back down along pad under strict control.',
    ],
    proTips: [
      'Keep armpits snug against top of bench pad.',
      'Don’t fully snap or lock out elbows at bottom to protect tendons.',
    ],
  },
  'Triceps Pushdown': {
    name: 'Triceps Pushdown',
    category: 'Arms',
    targetMuscles: ['Triceps Brachii (Lateral & Medial Heads)'],
    equipment: 'Cable Machine with Rope or Straight Bar',
    difficulty: 'Beginner',
    summary: 'High-isolation cable exercise for building horseshoe triceps shape.',
    steps: [
      'Stand in front of high cable pulley holding rope or bar attachment.',
      'Pin elbows securely against ribcage with forearms horizontal to floor.',
      'Push attachment down until arms lock out fully at bottom.',
      'Slowly allow attachment to return to 90 degree elbow position.',
    ],
    proTips: [
      'Keep upper arms stationary—only forearms should move.',
    ],
  },
  'Triceps Overhead Extension': {
    name: 'Triceps Overhead Extension',
    category: 'Arms',
    targetMuscles: ['Triceps (Long Head)'],
    equipment: 'Dumbbell or Cable Attachment',
    difficulty: 'Beginner',
    summary: 'Stretches and builds the long head of the triceps for full arm mass.',
    steps: [
      'Hold dumbbell overhead with both hands supporting inner weight plate.',
      'Lower dumbbell behind head by bending elbows while keeping upper arms upright.',
      'Press dumbbell back up overhead until arms extend fully.',
    ],
    proTips: [
      'Keep elbows pointed forward rather than flaring out to sides.',
    ],
  },
  'Barbell Bicep Curl': {
    name: 'Barbell Bicep Curl',
    category: 'Arms',
    targetMuscles: ['Biceps Brachii'],
    equipment: 'Barbell or EZ Bar',
    difficulty: 'Beginner',
    summary: 'Classic foundational bicep exercise for building arm thickness and strength.',
    steps: [
      'Stand shoulder-width apart holding barbell with underhand grip.',
      'Keep elbows close to sides, curl barbell up toward chest height.',
      'Squeeze biceps at top, then lower barbell down slowly.',
    ],
    proTips: [
      'Keep torso still; avoid leaning back to swing weight up.',
    ],
  },
  'Dumbbell Hammer Curl': {
    name: 'Dumbbell Hammer Curl',
    category: 'Arms',
    targetMuscles: ['Brachialis', 'Biceps', 'Forearms (Brachioradialis)'],
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    summary: 'Neutral grip curl for developing forearm thickness and bicep height.',
    steps: [
      'Stand holding dumbbells with palms facing each other (neutral grip).',
      'Curl dumbbells up toward shoulders while keeping palms facing in.',
      'Squeeze at top peak, then lower dumbbells down with control.',
    ],
    proTips: [
      'Great for building grip strength and elbow joint resilience.',
    ],
  },
  'Barbell Squats': {
    name: 'Barbell Squats',
    category: 'Legs',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    equipment: 'Barbell & Squat Rack',
    difficulty: 'Intermediate',
    summary: 'The king of leg exercises for full lower body mass, core strength, and power.',
    steps: [
      'Position barbell across upper back/traps, unrack and step back.',
      'Set feet shoulder-width apart, toes turned out slightly.',
      'Hinge hips and bend knees to lower down until thighs reach parallel with floor.',
      'Drive through heels and extend legs to return to standing position.',
    ],
    proTips: [
      'Keep chest elevated and maintain natural lumbar curve throughout.',
    ],
  },
  'Leg Press': {
    name: 'Leg Press',
    category: 'Legs',
    targetMuscles: ['Quadriceps', 'Glutes', 'Calves'],
    equipment: 'Leg Press Machine',
    difficulty: 'Beginner',
    summary: 'Allows heavy lower body loading with back support and reduced spine axial load.',
    steps: [
      'Sit on machine with back against pad and feet shoulder-width on platform.',
      'Unlatch safety levers and lower sled toward chest until knees bend to 90 degrees.',
      'Push through heels to press platform back up to starting position.',
    ],
    proTips: [
      'Never lock knees completely out at top of press.',
      'Keep lower back pressed against seat pad at all times.',
    ],
  },
  'Romanian Deadlift': {
    name: 'Romanian Deadlift',
    category: 'Legs',
    targetMuscles: ['Hamstrings', 'Gluteus Maximus', 'Lower Back'],
    equipment: 'Barbell or Dumbbells',
    difficulty: 'Intermediate',
    summary: 'Hinge exercise targeting hamstrings and glutes through loaded stretch.',
    steps: [
      'Stand tall holding barbell at thigh level with slight bend in knees.',
      'Push hips backward while sliding bar down close to shins/legs.',
      'Lower until deep hamstring stretch is felt (around mid-shin height).',
      'Drive hips forward and squeeze glutes to stand back up tall.',
    ],
    proTips: [
      'Movement comes from pushing hips back, not rounding your lower back.',
    ],
  },
  'Leg Extension': {
    name: 'Leg Extension',
    category: 'Legs',
    targetMuscles: ['Quadriceps (Front Thighs)'],
    equipment: 'Leg Extension Machine',
    difficulty: 'Beginner',
    summary: 'Isolates quadriceps to detail quad sweep and tear-drop muscle shape.',
    steps: [
      'Adjust machine pad to rest across lower shins just above ankles.',
      'Extend legs upward until knees are fully straight, squeezing quads at top.',
      'Pause 1 second, then lower pad back down under control.',
    ],
    proTips: [
      'Keep hips seated firmly back against backrest.',
    ],
  },
  'Lying Leg Curl': {
    name: 'Lying Leg Curl',
    category: 'Legs',
    targetMuscles: ['Hamstrings'],
    equipment: 'Lying Leg Curl Machine',
    difficulty: 'Beginner',
    summary: 'Directly isolates hamstrings through knee flexion.',
    steps: [
      'Lie face down on machine with roller pad resting on back of lower shins.',
      'Curl pad upward toward glutes as far as possible.',
      'Squeeze hamstrings at peak bend, then lower pad back down smoothly.',
    ],
    proTips: [
      'Keep hips pressed flat against bench pad without arching lower back.',
    ],
  },
  'Calf Raises': {
    name: 'Calf Raises',
    category: 'Legs',
    targetMuscles: ['Gastrocnemius & Soleus (Calves)'],
    equipment: 'Standing Calf Machine or Dumbbell',
    difficulty: 'Beginner',
    summary: 'Builds lower leg calf density and ankle stability through ankle extension.',
    steps: [
      'Place balls of feet on step/block with heels hanging off edge.',
      'Lower heels down below block level to feel deep calf stretch.',
      'Rise up as high as possible onto toes, contracting calves at top.',
    ],
    proTips: [
      'Hold top contraction for 1 to 2 seconds for maximal muscle activation.',
    ],
  },
  'Plank': {
    name: 'Plank',
    category: 'Core',
    targetMuscles: ['Transverse Abdominis', 'Rectus Abdominis', 'Obliques'],
    equipment: 'Floor Mat',
    difficulty: 'Beginner',
    summary: 'Isometric core stability hold for abdominal strength and spine health.',
    steps: [
      'Place forearms on floor shoulder-width apart, legs extended back.',
      'Form straight line from head to heels.',
      'Hold position bracing abs like getting punched in stomach.',
    ],
    proTips: [
      'Don’t let hips sag downward or pike up into air.',
    ],
  },
  'Treadmill Running': {
    name: 'Treadmill Running',
    category: 'Cardio',
    targetMuscles: ['Cardiovascular System', 'Legs', 'Stamina'],
    equipment: 'Treadmill',
    difficulty: 'Beginner',
    summary: 'Aerobic exercise for fat loss, cardiovascular health, and endurance.',
    steps: [
      'Set treadmill speed and incline to target level.',
      'Maintain upright posture with natural arm swing.',
      'Land on midfoot under hips.',
    ],
    proTips: [
      'Warm up with 3 minutes of light walking before increasing speed.',
    ],
  },
};

export function getExerciseGuide(exerciseName: string): ExerciseGuide {
  // Direct match or partial match fallback
  if (EXERCISE_GUIDES[exerciseName]) {
    return EXERCISE_GUIDES[exerciseName];
  }

  // Fallback search
  const foundKey = Object.keys(EXERCISE_GUIDES).find((k) =>
    exerciseName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(exerciseName.toLowerCase())
  );

  if (foundKey) {
    return EXERCISE_GUIDES[foundKey];
  }

  // Default fallback guide
  return {
    name: exerciseName,
    category: 'General',
    targetMuscles: ['Target Muscle Groups'],
    equipment: 'Gym Equipment or Bodyweight',
    difficulty: 'Beginner',
    summary: `Guide and instructions for ${exerciseName}. Perform sets with proper form and control.`,
    steps: [
      'Set up in a comfortable starting position with proper joint alignment.',
      'Perform repetitions with smooth, controlled movement through full range of motion.',
      'Breathe out during the effort/concentric phase and breathe in when returning to start.',
      'Rest 60-90 seconds between sets.',
    ],
    proTips: [
      'Focus on feeling the target muscle contract rather than just moving the weight.',
      'Maintain a neutral spine and controlled tempo on every set.',
    ],
  };
}
