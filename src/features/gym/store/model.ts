import { z } from 'zod';

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
