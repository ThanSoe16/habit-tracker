import type { BodyMetricRow } from '@/features/gym/services/body-metrics';
import type {
  Exercise,
  ExerciseCategory,
  GymSettings,
  PlanDay,
  PlanExercise,
  WorkoutLog,
} from './model';

export interface GymStore {
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
