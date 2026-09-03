'use client';

import { create } from 'zustand';
import { gymService } from '@/features/gym/services/supabase';
import { gymBodyMetricsService, type BodyMetricRow } from '@/features/gym/services/body-metrics';
import { z } from 'zod';

const workoutLogSaveQueues = new Map<string, Promise<void>>();

function saveWorkoutLog(dateStr: string, log: WorkoutLog) {
  const previousSave = workoutLogSaveQueues.get(dateStr) ?? Promise.resolve();
  const nextSave = previousSave
    .catch(() => undefined)
    .then(() => gymService.upsertWorkoutLog(dateStr, log));

  workoutLogSaveQueues.set(dateStr, nextSave);
  void nextSave.finally(() => {
    if (workoutLogSaveQueues.get(dateStr) === nextSave) {
      workoutLogSaveQueues.delete(dateStr);
    }
  });
}

export const exerciseCategorySchema = z.enum([
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Other',
]);

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: exerciseCategorySchema,
  defaultSets: z.number().optional(),
  defaultReps: z.string().optional(),
  isCustom: z.boolean().optional(),
  imageUrl: z.string().nullable().optional(),
});

export const exerciseSetDetailSchema = z.object({
  setNumber: z.number(),
  reps: z.number(),
  weightKg: z.number(),
});

export const planExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  name: z.string(),
  category: exerciseCategorySchema,
  targetSets: z.number(),
  targetReps: z.string(),
  weight: z.string().optional(),
  setsDetails: z.array(exerciseSetDetailSchema).optional(),
});

export const planDaySchema = z.object({
  dayIndex: z.number(),
  dayName: z.string(),
  title: z.string(),
  isRestDay: z.boolean(),
  exercises: z.array(planExerciseSchema),
});

export const completedExerciseLogSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  name: z.string(),
  category: exerciseCategorySchema,
  targetSets: z.number(),
  completedSets: z.number(),
  targetReps: z.string(),
  weight: z.string().optional(),
  completed: z.boolean(),
  setsDetails: z.array(exerciseSetDetailSchema).optional(),
});

export const workoutLogSchema = z.object({
  id: z.string(),
  date: z.string(),
  dayIndex: z.number(),
  dayTitle: z.string(),
  completed: z.boolean(),
  notes: z.string().optional(),
  exercises: z.array(completedExerciseLogSchema),
  completedAt: z.string().optional(),
});

export type ExerciseCategory = z.infer<typeof exerciseCategorySchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseSetDetail = z.infer<typeof exerciseSetDetailSchema>;
export type PlanExercise = z.infer<typeof planExerciseSchema>;
export type PlanDay = z.infer<typeof planDaySchema>;
export type CompletedExerciseLog = z.infer<typeof completedExerciseLogSchema>;
export type WorkoutLog = z.infer<typeof workoutLogSchema>;

export const PRESET_EXERCISES: Exercise[] = [
  // Chest & Push-up Variations
  {
    id: 'ex-1',
    name: 'Incline Chest Press',
    category: 'Chest',
    defaultSets: 4,
    defaultReps: '8-12',
  },
  { id: 'ex-2', name: 'Flat Chest Press', category: 'Chest', defaultSets: 4, defaultReps: '8-12' },
  {
    id: 'ex-3',
    name: 'Barbell Bench Press',
    category: 'Chest',
    defaultSets: 4,
    defaultReps: '8-10',
  },
  { id: 'ex-4', name: 'Chest Flyes', category: 'Chest', defaultSets: 3, defaultReps: '12-15' },
  {
    id: 'ex-5',
    name: 'Standard Push-ups',
    category: 'Chest',
    defaultSets: 3,
    defaultReps: '15-20',
  },
  {
    id: 'ex-35',
    name: 'Decline Push-ups (Upper Chest)',
    category: 'Chest',
    defaultSets: 3,
    defaultReps: '12-15',
  },
  {
    id: 'ex-36',
    name: 'Incline Push-ups (Lower Chest)',
    category: 'Chest',
    defaultSets: 3,
    defaultReps: '15-20',
  },
  {
    id: 'ex-37',
    name: 'Diamond Push-ups (Triceps & Inner Chest)',
    category: 'Chest',
    defaultSets: 3,
    defaultReps: '10-12',
  },
  {
    id: 'ex-38',
    name: 'Wide-Grip Push-ups (Outer Chest)',
    category: 'Chest',
    defaultSets: 3,
    defaultReps: '12-15',
  },
  {
    id: 'ex-39',
    name: 'Pike Push-ups (Shoulders)',
    category: 'Shoulders',
    defaultSets: 3,
    defaultReps: '10-12',
  },
  {
    id: 'ex-40',
    name: 'Archer Push-ups (Unilateral Chest)',
    category: 'Chest',
    defaultSets: 3,
    defaultReps: '8-10 per side',
  },

  // Back
  {
    id: 'ex-6',
    name: 'Pull-ups / Lat Pulldown',
    category: 'Back',
    defaultSets: 4,
    defaultReps: '8-12',
  },
  {
    id: 'ex-7',
    name: 'Barbell Bent-Over Row',
    category: 'Back',
    defaultSets: 4,
    defaultReps: '8-10',
  },
  { id: 'ex-8', name: 'Seated Cable Row', category: 'Back', defaultSets: 3, defaultReps: '10-12' },
  {
    id: 'ex-9',
    name: 'Single-Arm Dumbbell Row',
    category: 'Back',
    defaultSets: 3,
    defaultReps: '10-12',
  },

  // Legs
  { id: 'ex-10', name: 'Barbell Squats', category: 'Legs', defaultSets: 4, defaultReps: '8-10' },
  { id: 'ex-11', name: 'Leg Press', category: 'Legs', defaultSets: 3, defaultReps: '10-12' },
  { id: 'ex-12', name: 'Romanian Deadlift', category: 'Legs', defaultSets: 4, defaultReps: '8-10' },
  { id: 'ex-13', name: 'Leg Extension', category: 'Legs', defaultSets: 3, defaultReps: '12-15' },
  { id: 'ex-14', name: 'Lying Leg Curl', category: 'Legs', defaultSets: 3, defaultReps: '12-15' },
  { id: 'ex-15', name: 'Calf Raises', category: 'Legs', defaultSets: 4, defaultReps: '15-20' },

  // Shoulders
  {
    id: 'ex-16',
    name: 'Shoulder Press',
    category: 'Shoulders',
    defaultSets: 4,
    defaultReps: '8-12',
  },
  {
    id: 'ex-17',
    name: 'Lateral Raises',
    category: 'Shoulders',
    defaultSets: 4,
    defaultReps: '12-15',
  },
  { id: 'ex-18', name: 'Face Pulls', category: 'Shoulders', defaultSets: 3, defaultReps: '15' },
  {
    id: 'ex-19',
    name: 'Front Dumbbell Raise',
    category: 'Shoulders',
    defaultSets: 3,
    defaultReps: '12',
  },

  // Arms
  {
    id: 'ex-20',
    name: 'Triceps Overhead Extension',
    category: 'Arms',
    defaultSets: 3,
    defaultReps: '10-12',
  },
  { id: 'ex-21', name: 'Triceps Pushdown', category: 'Arms', defaultSets: 3, defaultReps: '10-12' },
  {
    id: 'ex-22',
    name: 'Barbell Bicep Curl',
    category: 'Arms',
    defaultSets: 3,
    defaultReps: '10-12',
  },
  {
    id: 'ex-23',
    name: 'Dumbbell Hammer Curl',
    category: 'Arms',
    defaultSets: 3,
    defaultReps: '10-12',
  },

  // Core / Abs
  { id: 'ex-24', name: 'Plank', category: 'Core', defaultSets: 3, defaultReps: '60s' },
  {
    id: 'ex-25',
    name: 'Hanging Leg Raise',
    category: 'Core',
    defaultSets: 3,
    defaultReps: '12-15',
  },
  {
    id: 'ex-28',
    name: 'Cable Crunch (Upper Abs)',
    category: 'Core',
    defaultSets: 3,
    defaultReps: '12-15',
  },
  {
    id: 'ex-29',
    name: 'Russian Twists (Obliques)',
    category: 'Core',
    defaultSets: 3,
    defaultReps: '20',
  },
  { id: 'ex-30', name: 'Bicycle Crunches', category: 'Core', defaultSets: 3, defaultReps: '15-20' },
  { id: 'ex-31', name: 'Ab Wheel Rollout', category: 'Core', defaultSets: 3, defaultReps: '10-12' },
  { id: 'ex-32', name: 'Mountain Climbers', category: 'Core', defaultSets: 3, defaultReps: '45s' },
  {
    id: 'ex-33',
    name: 'Side Plank (Obliques)',
    category: 'Core',
    defaultSets: 3,
    defaultReps: '45s per side',
  },
  {
    id: 'ex-34',
    name: 'Reverse Crunch (Lower Abs)',
    category: 'Core',
    defaultSets: 3,
    defaultReps: '12-15',
  },

  // Cardio
  {
    id: 'ex-26',
    name: 'Treadmill Running',
    category: 'Cardio',
    defaultSets: 1,
    defaultReps: '20 mins',
  },
  {
    id: 'ex-27',
    name: 'Stationary Cycling',
    category: 'Cardio',
    defaultSets: 1,
    defaultReps: '30 mins',
  },
];

export const DEFAULT_DAY1_EXERCISES: PlanExercise[] = [
  {
    id: 'd1-ex-1',
    exerciseId: 'ex-1',
    name: 'Incline Chest Press',
    category: 'Chest',
    targetSets: 4,
    targetReps: '8-12',
  },
  {
    id: 'd1-ex-2',
    exerciseId: 'ex-2',
    name: 'Flat Chest Press',
    category: 'Chest',
    targetSets: 4,
    targetReps: '8-12',
  },
  {
    id: 'd1-ex-3',
    exerciseId: 'ex-16',
    name: 'Shoulder Press',
    category: 'Shoulders',
    targetSets: 4,
    targetReps: '8-12',
  },
  {
    id: 'd1-ex-4',
    exerciseId: 'ex-17',
    name: 'Lateral Raises',
    category: 'Shoulders',
    targetSets: 4,
    targetReps: '12-15',
  },
  {
    id: 'd1-ex-5',
    exerciseId: 'ex-20',
    name: 'Triceps Overhead Extension',
    category: 'Arms',
    targetSets: 3,
    targetReps: '10-12',
  },
  {
    id: 'd1-ex-6',
    exerciseId: 'ex-21',
    name: 'Triceps Pushdown',
    category: 'Arms',
    targetSets: 3,
    targetReps: '10-12',
  },
];

export const DEFAULT_DAY2_EXERCISES: PlanExercise[] = [
  {
    id: 'd2-ex-1',
    exerciseId: 'ex-7',
    name: 'Horizontal Pull (Seated Row)',
    category: 'Back',
    targetSets: 4,
    targetReps: '8-10',
  },
  {
    id: 'd2-ex-2',
    exerciseId: 'ex-8',
    name: 'Horizontal Pull (Chest-Supported Row)',
    category: 'Back',
    targetSets: 4,
    targetReps: '8-10',
  },
  {
    id: 'd2-ex-3',
    exerciseId: 'ex-6',
    name: 'Vertical Pull (Lat Pulldown)',
    category: 'Back',
    targetSets: 4,
    targetReps: '8-12',
  },
  {
    id: 'd2-ex-4',
    exerciseId: 'ex-18',
    name: 'Rear Delt Flyes / Reverse Fly',
    category: 'Shoulders',
    targetSets: 3,
    targetReps: '12-15',
  },
  {
    id: 'd2-ex-5',
    exerciseId: 'ex-22',
    name: 'Preacher Bicep Curl',
    category: 'Arms',
    targetSets: 3,
    targetReps: '10-12',
  },
  {
    id: 'd2-ex-6',
    exerciseId: 'ex-23',
    name: 'Incline Dumbbell Bicep Curl',
    category: 'Arms',
    targetSets: 3,
    targetReps: '10-12',
  },
];

export const DEFAULT_DAY3_EXERCISES: PlanExercise[] = [
  {
    id: 'd3-ex-1',
    exerciseId: 'ex-10',
    name: 'Squat Pattern (Barbell Squat)',
    category: 'Legs',
    targetSets: 4,
    targetReps: '8-10',
  },
  {
    id: 'd3-ex-2',
    exerciseId: 'ex-11',
    name: 'Leg Press',
    category: 'Legs',
    targetSets: 4,
    targetReps: '10-12',
  },
  {
    id: 'd3-ex-3',
    exerciseId: 'ex-12',
    name: 'RDL (Romanian Deadlift)',
    category: 'Legs',
    targetSets: 4,
    targetReps: '8-10',
  },
  {
    id: 'd3-ex-4',
    exerciseId: 'ex-13',
    name: 'Leg Extension',
    category: 'Legs',
    targetSets: 3,
    targetReps: '12-15',
  },
  {
    id: 'd3-ex-5',
    exerciseId: 'ex-14',
    name: 'Leg Curl',
    category: 'Legs',
    targetSets: 3,
    targetReps: '12-15',
  },
  {
    id: 'd3-ex-6',
    exerciseId: 'ex-15',
    name: 'Calf Raises',
    category: 'Legs',
    targetSets: 4,
    targetReps: '15-20',
  },
];

export const DEFAULT_DAY5_EXERCISES: PlanExercise[] = [
  {
    id: 'd5-ex-1',
    exerciseId: 'ex-1',
    name: 'Incline Chest Press',
    category: 'Chest',
    targetSets: 4,
    targetReps: '8-12',
  },
  {
    id: 'd5-ex-2',
    exerciseId: 'ex-6',
    name: 'Vertical Pull (Lat Pulldown)',
    category: 'Back',
    targetSets: 4,
    targetReps: '8-12',
  },
  {
    id: 'd5-ex-3',
    exerciseId: 'ex-16',
    name: 'Shoulder Press',
    category: 'Shoulders',
    targetSets: 4,
    targetReps: '8-12',
  },
  {
    id: 'd5-ex-4',
    exerciseId: 'ex-17',
    name: 'Lateral Raises',
    category: 'Shoulders',
    targetSets: 4,
    targetReps: '12-15',
  },
  {
    id: 'd5-ex-5',
    exerciseId: 'ex-22',
    name: 'Preacher Bicep Curl',
    category: 'Arms',
    targetSets: 3,
    targetReps: '10-12',
  },
  {
    id: 'd5-ex-6',
    exerciseId: 'ex-21',
    name: 'Triceps Pushdown',
    category: 'Arms',
    targetSets: 3,
    targetReps: '10-12',
  },
];

export const DEFAULT_DAY6_EXERCISES: PlanExercise[] = [
  {
    id: 'd6-ex-1',
    exerciseId: 'ex-12',
    name: 'RDL (Romanian Deadlift)',
    category: 'Legs',
    targetSets: 4,
    targetReps: '8-10',
  },
  {
    id: 'd6-ex-2',
    exerciseId: 'ex-29',
    name: 'Split Squat (Bulgarian / Dumbbell)',
    category: 'Legs',
    targetSets: 4,
    targetReps: '10-12',
  },
  {
    id: 'd6-ex-3',
    exerciseId: 'ex-14',
    name: 'Hamstring Curl',
    category: 'Legs',
    targetSets: 3,
    targetReps: '12-15',
  },
  {
    id: 'd6-ex-4',
    exerciseId: 'ex-13',
    name: 'Leg Extension',
    category: 'Legs',
    targetSets: 3,
    targetReps: '12-15',
  },
  {
    id: 'd6-ex-5',
    exerciseId: 'ex-30',
    name: 'Back Extension (Hyperextension)',
    category: 'Back',
    targetSets: 3,
    targetReps: '12-15',
  },
  {
    id: 'd6-ex-6',
    exerciseId: 'ex-15',
    name: 'Calf Raises',
    category: 'Legs',
    targetSets: 4,
    targetReps: '15-20',
  },
];

const DEFAULT_INITIAL_PLAN: PlanDay[] = [
  {
    dayIndex: 0,
    dayName: 'Day 1',
    title: 'Chest, Shoulders & Triceps',
    isRestDay: false,
    exercises: DEFAULT_DAY1_EXERCISES,
  },
  {
    dayIndex: 1,
    dayName: 'Day 2',
    title: 'Back, Rear Delt & Biceps',
    isRestDay: false,
    exercises: DEFAULT_DAY2_EXERCISES,
  },
  {
    dayIndex: 2,
    dayName: 'Day 3',
    title: 'Legs & Calves',
    isRestDay: false,
    exercises: DEFAULT_DAY3_EXERCISES,
  },
  {
    dayIndex: 3,
    dayName: 'Day 4',
    title: 'Rest & Recovery',
    isRestDay: true,
    exercises: [],
  },
  {
    dayIndex: 4,
    dayName: 'Day 5',
    title: 'Upper Body (Chest, Back, Shoulders & Arms)',
    isRestDay: false,
    exercises: DEFAULT_DAY5_EXERCISES,
  },
  {
    dayIndex: 5,
    dayName: 'Day 6',
    title: 'Lower Body (Legs, Glutes & Calves)',
    isRestDay: false,
    exercises: DEFAULT_DAY6_EXERCISES,
  },
  {
    dayIndex: 6,
    dayName: 'Day 7',
    title: 'Rest & Active Recovery',
    isRestDay: true,
    exercises: [],
  },
];

const syncUncompletedLogsWithPlan = (
  weeklyPlan: PlanDay[],
  history: Record<string, WorkoutLog>,
) => {
  const newHistory = { ...history };
  Object.keys(newHistory).forEach((dateStr) => {
    const log = newHistory[dateStr];
    if (log && !log.completed) {
      const planDay = weeklyPlan[log.dayIndex];
      if (planDay) {
        newHistory[dateStr] = {
          ...log,
          dayTitle: planDay.title,
          exercises: planDay.exercises.map((ex) => {
            const existingEx = log.exercises.find(
              (e) => e.id === ex.id || e.exerciseId === ex.exerciseId,
            );
            return {
              id: ex.id,
              exerciseId: ex.exerciseId,
              name: ex.name,
              category: ex.category,
              targetSets: ex.targetSets,
              completedSets: existingEx ? Math.min(existingEx.completedSets, ex.targetSets) : 0,
              targetReps: ex.targetReps,
              weight: ex.weight,
              completed: existingEx ? existingEx.completed : false,
            };
          }),
        };
      }
    }
  });
  return newHistory;
};

export const gymSettingsSchema = z.object({
  weightUnit: z.enum(['kg', 'lbs']),
  heightUnit: z.enum(['cm', 'ft-in']),
  heightCm: z.number(),
  heightFt: z.number(),
  heightIn: z.number(),
  startWeightKg: z.number(),
  currentWeightKg: z.number(),
  targetWeightKg: z.number(),
  targetDeadline: z.string(),
  weeklyPace: z.string(),
  reminderDays: z.array(z.string()),
  reminderFrequency: z.string(),
  dob: z.string(),
  gender: z.enum(['Male', 'Female', 'Other']),
  fitnessGoal: z.string(),
  bodyFatPct: z.number().optional(),
  activityLevel: z.string(),
  hydrationGoalMl: z.number(),
  dailyHydrationLogs: z.record(z.number()),
  restTimerSeconds: z.number(),
  autoFinishWorkout: z.boolean(),
  showCategoryBadges: z.boolean(),
  defaultTargetSets: z.number(),
});

export type GymSettings = z.infer<typeof gymSettingsSchema>;

export const DEFAULT_GYM_SETTINGS: GymSettings = {
  weightUnit: 'kg',
  heightUnit: 'cm',
  heightCm: 175,
  heightFt: 5,
  heightIn: 9,
  startWeightKg: 75,
  currentWeightKg: 75,
  targetWeightKg: 72,
  targetDeadline: 'Jun 13',
  weeklyPace: 'Fast (1.10lbs/wk)',
  reminderDays: ['Mo', 'Tu', 'We'],
  reminderFrequency: 'Active Daily',
  dob: '1998-05-15',
  gender: 'Male',
  fitnessGoal: 'Muscle Gain',
  bodyFatPct: 18,
  activityLevel: 'Moderately Active',
  hydrationGoalMl: 2500,
  dailyHydrationLogs: {},
  restTimerSeconds: 60,
  autoFinishWorkout: false,
  showCategoryBadges: true,
  defaultTargetSets: 4,
};

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function ftInToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function calculateAge(dobStr?: string): number | null {
  if (!dobStr) return null;
  const birth = new Date(dobStr);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

interface GymStore {
  weeklyPlan: PlanDay[];
  customExercises: Exercise[];
  history: Record<string, WorkoutLog>; // key: YYYY-MM-DD
  activeDayIndex: number; // Selected active day index (0-6)
  gymSettings: GymSettings;
  bodyMetricLogs: BodyMetricRow[];
  isLoaded: boolean;

  // Actions
  fetchFromSupabase: () => Promise<void>;
  updateGymSettings: (updates: Partial<GymSettings>) => void;
  setWeightGoal: (updates: Partial<GymSettings>) => void;
  setHydrationGoal: (goalMl: number) => void;
  logWaterIntake: (dateStr: string, deltaMl: number) => void;
  setDailyWaterIntake: (dateStr: string, totalMl: number) => void;
  addBodyMetricLog: (log: BodyMetricRow) => Promise<void>;
  deleteBodyMetricLog: (id: string) => Promise<void>;
  setActiveDayIndex: (index: number) => void;
  updateDayTitle: (dayIndex: number, title: string) => void;
  toggleRestDay: (dayIndex: number) => void;
  addExerciseToDay: (
    dayIndex: number,
    exercise: Exercise,
    sets?: number,
    reps?: string,
    weight?: string,
  ) => void;
  removeExerciseFromDay: (dayIndex: number, planExerciseId: string) => void;
  updatePlanExercise: (
    dayIndex: number,
    planExerciseId: string,
    updates: Partial<PlanExercise>,
  ) => void;
  addCustomExercise: (
    name: string,
    category: ExerciseCategory,
    defaultSets?: number,
    defaultReps?: string,
    imageUrl?: string | null,
  ) => Exercise;
  updateCustomExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteCustomExercise: (id: string) => void;
  applyDefaultDay1Routine: () => void;
  applyDefaultDay2Routine: () => void;
  applyDefaultDay3Routine: () => void;
  applyDefaultDay5Routine: () => void;
  applyDefaultDay6Routine: () => void;
  resetWeeklyPlanToDefault: () => void;

  // Logging & Completion
  getWorkoutLogForDate: (dateStr: string) => WorkoutLog | null;
  initializeWorkoutLogForDate: (dateStr: string, dayIndex?: number) => WorkoutLog;
  updateCompletedSet: (dateStr: string, planExerciseId: string, deltaSets: number) => void;
  toggleExerciseDone: (dateStr: string, planExerciseId: string) => void;
  finishWorkout: (dateStr: string, notes?: string) => void;
  deleteWorkoutLog: (dateStr: string) => void;
}

export const useGymStore = create<GymStore>()((set, get) => ({
  weeklyPlan: DEFAULT_INITIAL_PLAN,
  customExercises: [],
  history: {},
  activeDayIndex: 0,
  gymSettings: DEFAULT_GYM_SETTINGS,
  bodyMetricLogs: [],
  isLoaded: false,

  fetchFromSupabase: async () => {
    try {
      const remotePlans = await gymService.fetchGymPlans();
      const remoteCustomEx = await gymService.fetchCustomExercises();
      const remoteHistory = await gymService.fetchWorkoutLogs();
      const remoteSettings = await gymService.fetchGymSettings();
      const remoteMetrics = await gymBodyMetricsService.fetchLogs();

      if (remotePlans.length === 0) {
        for (const plan of DEFAULT_INITIAL_PLAN) {
          await gymService.upsertGymPlan(plan);
        }
      }

      set({
        weeklyPlan: remotePlans.length > 0 ? remotePlans : DEFAULT_INITIAL_PLAN,
        customExercises: remoteCustomEx,
        history: remoteHistory,
        gymSettings: {
          ...DEFAULT_GYM_SETTINGS,
          ...(remoteSettings || {}),
        },
        bodyMetricLogs: remoteMetrics,
        isLoaded: true,
      });
    } catch (e) {
      console.warn('Failed to fetch gym store from Supabase:', e);
      set({ isLoaded: true });
    }
  },

  addBodyMetricLog: async (row) => {
    const saved = await gymBodyMetricsService.insertLog(row);
    if (saved) {
      set((state) => ({
        bodyMetricLogs: [...state.bodyMetricLogs, saved].sort(
          (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
        ),
      }));
    }
  },

  deleteBodyMetricLog: async (id) => {
    await gymBodyMetricsService.deleteLog(id);
    set((state) => ({
      bodyMetricLogs: state.bodyMetricLogs.filter((m) => m.id !== id),
    }));
  },

  updateGymSettings: (updates) => {
    set((state) => {
      const newSettings = { ...state.gymSettings, ...updates };
      gymService.saveGymSettings(newSettings);
      return { gymSettings: newSettings };
    });
  },

  setWeightGoal: (updates) => {
    set((state) => {
      const newSettings = { ...state.gymSettings, ...updates };
      gymService.saveGymSettings(newSettings);
      return { gymSettings: newSettings };
    });
  },

  setHydrationGoal: (goalMl) => {
    set((state) => {
      const newSettings = { ...state.gymSettings, hydrationGoalMl: goalMl };
      gymService.saveGymSettings(newSettings);
      return { gymSettings: newSettings };
    });
  },

  logWaterIntake: (dateStr, deltaMl) => {
    set((state) => {
      const current = state.gymSettings.dailyHydrationLogs[dateStr] || 0;
      const updated = Math.max(0, current + deltaMl);
      const newLogs = { ...state.gymSettings.dailyHydrationLogs, [dateStr]: updated };
      const newSettings = { ...state.gymSettings, dailyHydrationLogs: newLogs };
      gymService.saveGymSettings(newSettings);
      return { gymSettings: newSettings };
    });
  },

  setDailyWaterIntake: (dateStr, totalMl) => {
    set((state) => {
      const newLogs = { ...state.gymSettings.dailyHydrationLogs, [dateStr]: totalMl };
      const newSettings = { ...state.gymSettings, dailyHydrationLogs: newLogs };
      gymService.saveGymSettings(newSettings);
      return { gymSettings: newSettings };
    });
  },

  setActiveDayIndex: (index) => set({ activeDayIndex: index }),

  updateDayTitle: (dayIndex, title) => {
    set((state) => {
      const newPlan = state.weeklyPlan.map((day) =>
        day.dayIndex === dayIndex ? { ...day, title } : day,
      );
      return {
        weeklyPlan: newPlan,
        history: syncUncompletedLogsWithPlan(newPlan, state.history),
      };
    });
  },

  toggleRestDay: (dayIndex) => {
    set((state) => {
      const newPlan = state.weeklyPlan.map((day) =>
        day.dayIndex === dayIndex ? { ...day, isRestDay: !day.isRestDay } : day,
      );
      return {
        weeklyPlan: newPlan,
        history: syncUncompletedLogsWithPlan(newPlan, state.history),
      };
    });
  },

  addExerciseToDay: (dayIndex, exercise, sets, reps, weight) => {
    const newPlanExercise: PlanExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      targetSets: sets || exercise.defaultSets || 3,
      targetReps: reps || exercise.defaultReps || '10',
      weight: weight || '',
    };

    set((state) => {
      const newPlan = state.weeklyPlan.map((day) =>
        day.dayIndex === dayIndex
          ? {
              ...day,
              isRestDay: false,
              exercises: [...day.exercises, newPlanExercise],
            }
          : day,
      );
      return {
        weeklyPlan: newPlan,
        history: syncUncompletedLogsWithPlan(newPlan, state.history),
      };
    });
  },

  removeExerciseFromDay: (dayIndex, planExerciseId) => {
    set((state) => {
      const newPlan = state.weeklyPlan.map((day) =>
        day.dayIndex === dayIndex
          ? {
              ...day,
              exercises: day.exercises.filter((ex) => ex.id !== planExerciseId),
            }
          : day,
      );
      return {
        weeklyPlan: newPlan,
        history: syncUncompletedLogsWithPlan(newPlan, state.history),
      };
    });
  },

  updatePlanExercise: (dayIndex, planExerciseId, updates) => {
    set((state) => {
      const newPlan = state.weeklyPlan.map((day) =>
        day.dayIndex === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === planExerciseId ? { ...ex, ...updates } : ex,
              ),
            }
          : day,
      );
      return {
        weeklyPlan: newPlan,
        history: syncUncompletedLogsWithPlan(newPlan, state.history),
      };
    });
  },

  addCustomExercise: (name, category, defaultSets = 4, defaultReps = '8-12', imageUrl) => {
    const newEx: Exercise = {
      id: `custom-${crypto.randomUUID()}`,
      name: name.trim(),
      category,
      defaultSets,
      defaultReps,
      isCustom: true,
      imageUrl,
    };
    set((state) => ({ customExercises: [...state.customExercises, newEx] }));
    gymService.upsertCustomExercise(newEx);
    return newEx;
  },

  updateCustomExercise: (id, updates) => {
    set((state) => {
      const updatedCustom = state.customExercises.map((ex) =>
        ex.id === id ? { ...ex, ...updates } : ex,
      );
      const updatedPlan = state.weeklyPlan.map((day) => ({
        ...day,
        exercises: day.exercises.map((e) =>
          e.exerciseId === id || e.id === id
            ? {
                ...e,
                name: updates.name ?? e.name,
                category: updates.category ?? e.category,
                targetSets: updates.defaultSets ?? e.targetSets,
                targetReps: updates.defaultReps ?? e.targetReps,
              }
            : e,
        ),
      }));
      return {
        customExercises: updatedCustom,
        weeklyPlan: updatedPlan,
      };
    });
    const updated = get().customExercises.find((ex) => ex.id === id);
    if (updated) gymService.upsertCustomExercise(updated);
  },

  deleteCustomExercise: (id) => {
    set((state) => ({
      customExercises: state.customExercises.filter((ex) => ex.id !== id),
      weeklyPlan: state.weeklyPlan.map((day) => ({
        ...day,
        exercises: day.exercises.filter((e) => e.exerciseId !== id && e.id !== id),
      })),
    }));
    gymService.deleteCustomExercise(id);
  },

  applyDefaultDay1Routine: () => {
    set((state) => {
      const newPlan = state.weeklyPlan.map((day) =>
        day.dayIndex === 0
          ? {
              ...day,
              title: 'Chest, Shoulders & Triceps',
              isRestDay: false,
              exercises: DEFAULT_DAY1_EXERCISES,
            }
          : day,
      );
      return {
        weeklyPlan: newPlan,
        history: syncUncompletedLogsWithPlan(newPlan, state.history),
      };
    });
  },

  applyDefaultDay2Routine: () => {
    set((state) => {
      const newPlan = state.weeklyPlan.map((day) =>
        day.dayIndex === 1
          ? {
              ...day,
              title: 'Back, Rear Delt & Biceps',
              isRestDay: false,
              exercises: DEFAULT_DAY2_EXERCISES,
            }
          : day,
      );
      return {
        weeklyPlan: newPlan,
        history: syncUncompletedLogsWithPlan(newPlan, state.history),
      };
    });
  },

  applyDefaultDay3Routine: () => {
    set((state) => {
      const newPlan = state.weeklyPlan.map((day) =>
        day.dayIndex === 2
          ? {
              ...day,
              title: 'Legs & Calves',
              isRestDay: false,
              exercises: DEFAULT_DAY3_EXERCISES,
            }
          : day,
      );
      return {
        weeklyPlan: newPlan,
        history: syncUncompletedLogsWithPlan(newPlan, state.history),
      };
    });
  },

  applyDefaultDay5Routine: () => {
    set((state) => {
      const newPlan = state.weeklyPlan.map((day) =>
        day.dayIndex === 4
          ? {
              ...day,
              title: 'Upper Body (Chest, Back, Shoulders & Arms)',
              isRestDay: false,
              exercises: DEFAULT_DAY5_EXERCISES,
            }
          : day,
      );
      return {
        weeklyPlan: newPlan,
        history: syncUncompletedLogsWithPlan(newPlan, state.history),
      };
    });
  },

  applyDefaultDay6Routine: () => {
    set((state) => {
      const newPlan = state.weeklyPlan.map((day) =>
        day.dayIndex === 5
          ? {
              ...day,
              title: 'Lower Body (Legs, Glutes & Calves)',
              isRestDay: false,
              exercises: DEFAULT_DAY6_EXERCISES,
            }
          : day,
      );
      return {
        weeklyPlan: newPlan,
        history: syncUncompletedLogsWithPlan(newPlan, state.history),
      };
    });
  },

  resetWeeklyPlanToDefault: () => {
    set((state) => ({
      weeklyPlan: DEFAULT_INITIAL_PLAN,
      history: syncUncompletedLogsWithPlan(DEFAULT_INITIAL_PLAN, state.history),
    }));
  },

  getWorkoutLogForDate: (dateStr) => {
    const state = get();
    const existing = state.history[dateStr];
    if (existing) return existing;

    const dateObj = new Date(dateStr + 'T00:00:00');
    const jsDay = dateObj.getDay();
    const mappedDayIndex = jsDay === 0 ? 6 : jsDay - 1;
    const dayPlan = state.weeklyPlan[mappedDayIndex] || state.weeklyPlan[0];

    if (!dayPlan || dayPlan.isRestDay) {
      return {
        id: `rest-${dateStr}`,
        date: dateStr,
        dayIndex: mappedDayIndex,
        dayTitle: dayPlan?.title || 'Rest Day',
        completed: false,
        exercises: [],
      };
    }

    return {
      id: `temp-${dateStr}`,
      date: dateStr,
      dayIndex: dayPlan.dayIndex,
      dayTitle: dayPlan.title,
      completed: false,
      exercises: dayPlan.exercises.map((ex) => ({
        id: ex.id,
        exerciseId: ex.exerciseId,
        name: ex.name,
        category: ex.category,
        targetSets: ex.targetSets,
        completedSets: 0,
        targetReps: ex.targetReps,
        weight: ex.weight,
        completed: false,
      })),
    };
  },

  initializeWorkoutLogForDate: (dateStr, dayIndex) => {
    const state = get();
    const dateObj = new Date(dateStr + 'T00:00:00');
    const jsDay = dateObj.getDay();
    const mappedDayIndex = dayIndex !== undefined ? dayIndex : jsDay === 0 ? 6 : jsDay - 1;
    const dayPlan = state.weeklyPlan[mappedDayIndex] || state.weeklyPlan[0];

    const existingLog = state.history[dateStr];
    if (existingLog) {
      if (!existingLog.completed) {
        const updatedExercises = dayPlan.exercises.map((ex) => {
          const prevEx = existingLog.exercises.find(
            (e) => e.id === ex.id || e.exerciseId === ex.exerciseId,
          );
          return {
            id: ex.id,
            exerciseId: ex.exerciseId,
            name: ex.name,
            category: ex.category,
            targetSets: ex.targetSets,
            completedSets: prevEx ? Math.min(prevEx.completedSets, ex.targetSets) : 0,
            targetReps: ex.targetReps,
            weight: ex.weight,
            completed: prevEx ? prevEx.completed : false,
          };
        });

        const syncedLog: WorkoutLog = {
          ...existingLog,
          dayIndex: dayPlan.dayIndex,
          dayTitle: dayPlan.title,
          exercises: updatedExercises,
        };

        set((s) => ({
          history: {
            ...s.history,
            [dateStr]: syncedLog,
          },
        }));

        return syncedLog;
      }
      return existingLog;
    }

    const initialLog: WorkoutLog = {
      id: crypto.randomUUID(),
      date: dateStr,
      dayIndex: dayPlan.dayIndex,
      dayTitle: dayPlan.title,
      completed: false,
      exercises: dayPlan.exercises.map((ex) => ({
        id: ex.id,
        exerciseId: ex.exerciseId,
        name: ex.name,
        category: ex.category,
        targetSets: ex.targetSets,
        completedSets: 0,
        targetReps: ex.targetReps,
        weight: ex.weight,
        completed: false,
      })),
    };

    set((s) => ({
      history: {
        ...s.history,
        [dateStr]: initialLog,
      },
    }));

    return initialLog;
  },

  updateCompletedSet: (dateStr, planExerciseId, deltaSets) => {
    if (!get().history[dateStr]) {
      get().initializeWorkoutLogForDate(dateStr);
    }

    set((state) => {
      const log = state.history[dateStr];
      if (!log) return state;

      const updatedExercises = log.exercises.map((ex) => {
        if (ex.id !== planExerciseId) return ex;
        const newSets = Math.max(0, Math.min(ex.targetSets + 5, ex.completedSets + deltaSets));
        const isCompleted = newSets >= ex.targetSets;
        return {
          ...ex,
          completedSets: newSets,
          completed: isCompleted,
        };
      });

      const allCompleted =
        updatedExercises.length > 0 && updatedExercises.every((e) => e.completed);

      return {
        history: {
          ...state.history,
          [dateStr]: {
            ...log,
            exercises: updatedExercises,
            completed: allCompleted,
            completedAt: allCompleted ? new Date().toISOString() : log.completedAt,
          },
        },
      };
    });

    const updatedLog = get().history[dateStr];
    if (updatedLog) saveWorkoutLog(dateStr, updatedLog);
  },

  toggleExerciseDone: (dateStr, planExerciseId) => {
    if (!get().history[dateStr]) {
      get().initializeWorkoutLogForDate(dateStr);
    }

    set((state) => {
      const log = state.history[dateStr];
      if (!log) return state;

      const updatedExercises = log.exercises.map((ex) => {
        if (ex.id !== planExerciseId) return ex;
        const nextState = !ex.completed;
        return {
          ...ex,
          completed: nextState,
          completedSets: nextState ? ex.targetSets : 0,
        };
      });

      const allCompleted =
        updatedExercises.length > 0 && updatedExercises.every((e) => e.completed);

      return {
        history: {
          ...state.history,
          [dateStr]: {
            ...log,
            exercises: updatedExercises,
            completed: allCompleted,
            completedAt: allCompleted ? new Date().toISOString() : log.completedAt,
          },
        },
      };
    });

    const updatedLog = get().history[dateStr];
    if (updatedLog) saveWorkoutLog(dateStr, updatedLog);
  },

  finishWorkout: (dateStr, notes) => {
    if (!get().history[dateStr]) {
      get().initializeWorkoutLogForDate(dateStr);
    }

    set((state) => {
      const log = state.history[dateStr];
      if (!log) return state;

      return {
        history: {
          ...state.history,
          [dateStr]: {
            ...log,
            completed: true,
            notes: notes !== undefined ? notes : log.notes,
            completedAt: new Date().toISOString(),
            exercises: log.exercises.map((ex) => ({
              ...ex,
              completed: true,
              completedSets: ex.completedSets > 0 ? ex.completedSets : ex.targetSets,
            })),
          },
        },
      };
    });

    const updatedLog = get().history[dateStr];
    if (updatedLog) saveWorkoutLog(dateStr, updatedLog);
  },

  deleteWorkoutLog: (dateStr) => {
    set((state) => {
      const newHistory = { ...state.history };
      delete newHistory[dateStr];
      return { history: newHistory };
    });
    gymService.deleteWorkoutLog(dateStr);
  },
}));

useGymStore.subscribe((state, previousState) => {
  if (
    state.weeklyPlan !== previousState.weeklyPlan &&
    JSON.stringify(state.weeklyPlan) !== JSON.stringify(previousState.weeklyPlan)
  ) {
    state.weeklyPlan.forEach((plan) => {
      void gymService.upsertGymPlan(plan);
    });
  }

  if (
    state.history !== previousState.history &&
    JSON.stringify(state.history) !== JSON.stringify(previousState.history)
  ) {
    Object.entries(state.history).forEach(([dateKey, log]) => {
      if (log !== previousState.history[dateKey]) {
        saveWorkoutLog(dateKey, log);
      }
    });
  }
});
