'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLocalDateString } from '@/utils/dateUtils';
import { gymService, gymBodyMetricsService, BodyMetricRow } from '@/lib/supabase/services';

export type ExerciseCategory =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Cardio'
  | 'Other';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  defaultSets?: number;
  defaultReps?: string;
  isCustom?: boolean;
}

export interface PlanExercise {
  id: string; // unique instance ID in the day's plan
  exerciseId: string;
  name: string;
  category: ExerciseCategory;
  targetSets: number;
  targetReps: string; // e.g. "8-12" or "10"
  weight?: string; // e.g. "20kg" or "50lbs"
}

export interface PlanDay {
  dayIndex: number; // 0 to 6 (Day 1 to Day 7)
  dayName: string; // "Day 1", "Day 2", etc.
  title: string; // e.g. "Chest & Triceps", "Push Day", "Rest"
  isRestDay: boolean;
  exercises: PlanExercise[];
}

export interface CompletedExerciseLog {
  id: string;
  exerciseId: string;
  name: string;
  category: ExerciseCategory;
  targetSets: number;
  completedSets: number;
  targetReps: string;
  weight?: string;
  completed: boolean;
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  dayIndex: number;
  dayTitle: string;
  completed: boolean;
  notes?: string;
  exercises: CompletedExerciseLog[];
  completedAt?: string;
}

export const PRESET_EXERCISES: Exercise[] = [
  // Chest
  { id: 'ex-1', name: 'Incline Chest Press', category: 'Chest', defaultSets: 4, defaultReps: '8-12' },
  { id: 'ex-2', name: 'Flat Chest Press', category: 'Chest', defaultSets: 4, defaultReps: '8-12' },
  { id: 'ex-3', name: 'Barbell Bench Press', category: 'Chest', defaultSets: 4, defaultReps: '8-10' },
  { id: 'ex-4', name: 'Chest Flyes', category: 'Chest', defaultSets: 3, defaultReps: '12-15' },
  { id: 'ex-5', name: 'Push-ups', category: 'Chest', defaultSets: 3, defaultReps: '15-20' },
  
  // Back
  { id: 'ex-6', name: 'Pull-ups / Lat Pulldown', category: 'Back', defaultSets: 4, defaultReps: '8-12' },
  { id: 'ex-7', name: 'Barbell Bent-Over Row', category: 'Back', defaultSets: 4, defaultReps: '8-10' },
  { id: 'ex-8', name: 'Seated Cable Row', category: 'Back', defaultSets: 3, defaultReps: '10-12' },
  { id: 'ex-9', name: 'Single-Arm Dumbbell Row', category: 'Back', defaultSets: 3, defaultReps: '10-12' },

  // Legs
  { id: 'ex-10', name: 'Barbell Squats', category: 'Legs', defaultSets: 4, defaultReps: '8-10' },
  { id: 'ex-11', name: 'Leg Press', category: 'Legs', defaultSets: 3, defaultReps: '10-12' },
  { id: 'ex-12', name: 'Romanian Deadlift', category: 'Legs', defaultSets: 4, defaultReps: '8-10' },
  { id: 'ex-13', name: 'Leg Extension', category: 'Legs', defaultSets: 3, defaultReps: '12-15' },
  { id: 'ex-14', name: 'Lying Leg Curl', category: 'Legs', defaultSets: 3, defaultReps: '12-15' },
  { id: 'ex-15', name: 'Calf Raises', category: 'Legs', defaultSets: 4, defaultReps: '15-20' },

  // Shoulders
  { id: 'ex-16', name: 'Shoulder Press', category: 'Shoulders', defaultSets: 4, defaultReps: '8-12' },
  { id: 'ex-17', name: 'Lateral Raises', category: 'Shoulders', defaultSets: 4, defaultReps: '12-15' },
  { id: 'ex-18', name: 'Face Pulls', category: 'Shoulders', defaultSets: 3, defaultReps: '15' },
  { id: 'ex-19', name: 'Front Dumbbell Raise', category: 'Shoulders', defaultSets: 3, defaultReps: '12' },

  // Arms
  { id: 'ex-20', name: 'Triceps Overhead Extension', category: 'Arms', defaultSets: 3, defaultReps: '10-12' },
  { id: 'ex-21', name: 'Triceps Pushdown', category: 'Arms', defaultSets: 3, defaultReps: '10-12' },
  { id: 'ex-22', name: 'Barbell Bicep Curl', category: 'Arms', defaultSets: 3, defaultReps: '10-12' },
  { id: 'ex-23', name: 'Dumbbell Hammer Curl', category: 'Arms', defaultSets: 3, defaultReps: '10-12' },

  // Core
  { id: 'ex-24', name: 'Plank', category: 'Core', defaultSets: 3, defaultReps: '60s' },
  { id: 'ex-25', name: 'Hanging Leg Raise', category: 'Core', defaultSets: 3, defaultReps: '12-15' },

  // Cardio
  { id: 'ex-26', name: 'Treadmill Running', category: 'Cardio', defaultSets: 1, defaultReps: '20 mins' },
  { id: 'ex-27', name: 'Stationary Cycling', category: 'Cardio', defaultSets: 1, defaultReps: '30 mins' },
];

export const DEFAULT_DAY1_EXERCISES: PlanExercise[] = [
  { id: 'd1-ex-1', exerciseId: 'ex-1', name: 'Incline Chest Press', category: 'Chest', targetSets: 4, targetReps: '8-12' },
  { id: 'd1-ex-2', exerciseId: 'ex-2', name: 'Flat Chest Press', category: 'Chest', targetSets: 4, targetReps: '8-12' },
  { id: 'd1-ex-3', exerciseId: 'ex-16', name: 'Shoulder Press', category: 'Shoulders', targetSets: 4, targetReps: '8-12' },
  { id: 'd1-ex-4', exerciseId: 'ex-17', name: 'Lateral Raises', category: 'Shoulders', targetSets: 4, targetReps: '12-15' },
  { id: 'd1-ex-5', exerciseId: 'ex-20', name: 'Triceps Overhead Extension', category: 'Arms', targetSets: 3, targetReps: '10-12' },
  { id: 'd1-ex-6', exerciseId: 'ex-21', name: 'Triceps Pushdown', category: 'Arms', targetSets: 3, targetReps: '10-12' },
];

export const DEFAULT_DAY2_EXERCISES: PlanExercise[] = [
  { id: 'd2-ex-1', exerciseId: 'ex-7', name: 'Horizontal Pull (Seated Row)', category: 'Back', targetSets: 4, targetReps: '8-10' },
  { id: 'd2-ex-2', exerciseId: 'ex-8', name: 'Horizontal Pull (Chest-Supported Row)', category: 'Back', targetSets: 4, targetReps: '8-10' },
  { id: 'd2-ex-3', exerciseId: 'ex-6', name: 'Vertical Pull (Lat Pulldown)', category: 'Back', targetSets: 4, targetReps: '8-12' },
  { id: 'd2-ex-4', exerciseId: 'ex-18', name: 'Rear Delt Flyes / Reverse Fly', category: 'Shoulders', targetSets: 3, targetReps: '12-15' },
  { id: 'd2-ex-5', exerciseId: 'ex-22', name: 'Preacher Bicep Curl', category: 'Arms', targetSets: 3, targetReps: '10-12' },
  { id: 'd2-ex-6', exerciseId: 'ex-23', name: 'Incline Dumbbell Bicep Curl', category: 'Arms', targetSets: 3, targetReps: '10-12' },
];

export const DEFAULT_DAY3_EXERCISES: PlanExercise[] = [
  { id: 'd3-ex-1', exerciseId: 'ex-10', name: 'Squat Pattern (Barbell Squat)', category: 'Legs', targetSets: 4, targetReps: '8-10' },
  { id: 'd3-ex-2', exerciseId: 'ex-11', name: 'Leg Press', category: 'Legs', targetSets: 4, targetReps: '10-12' },
  { id: 'd3-ex-3', exerciseId: 'ex-12', name: 'RDL (Romanian Deadlift)', category: 'Legs', targetSets: 4, targetReps: '8-10' },
  { id: 'd3-ex-4', exerciseId: 'ex-13', name: 'Leg Extension', category: 'Legs', targetSets: 3, targetReps: '12-15' },
  { id: 'd3-ex-5', exerciseId: 'ex-14', name: 'Leg Curl', category: 'Legs', targetSets: 3, targetReps: '12-15' },
  { id: 'd3-ex-6', exerciseId: 'ex-15', name: 'Calf Raises', category: 'Legs', targetSets: 4, targetReps: '15-20' },
];

export const DEFAULT_DAY5_EXERCISES: PlanExercise[] = [
  { id: 'd5-ex-1', exerciseId: 'ex-1', name: 'Incline Chest Press', category: 'Chest', targetSets: 4, targetReps: '8-12' },
  { id: 'd5-ex-2', exerciseId: 'ex-6', name: 'Vertical Pull (Lat Pulldown)', category: 'Back', targetSets: 4, targetReps: '8-12' },
  { id: 'd5-ex-3', exerciseId: 'ex-16', name: 'Shoulder Press', category: 'Shoulders', targetSets: 4, targetReps: '8-12' },
  { id: 'd5-ex-4', exerciseId: 'ex-17', name: 'Lateral Raises', category: 'Shoulders', targetSets: 4, targetReps: '12-15' },
  { id: 'd5-ex-5', exerciseId: 'ex-22', name: 'Preacher Bicep Curl', category: 'Arms', targetSets: 3, targetReps: '10-12' },
  { id: 'd5-ex-6', exerciseId: 'ex-21', name: 'Triceps Pushdown', category: 'Arms', targetSets: 3, targetReps: '10-12' },
];

export const DEFAULT_DAY6_EXERCISES: PlanExercise[] = [
  { id: 'd6-ex-1', exerciseId: 'ex-12', name: 'RDL (Romanian Deadlift)', category: 'Legs', targetSets: 4, targetReps: '8-10' },
  { id: 'd6-ex-2', exerciseId: 'ex-29', name: 'Split Squat (Bulgarian / Dumbbell)', category: 'Legs', targetSets: 4, targetReps: '10-12' },
  { id: 'd6-ex-3', exerciseId: 'ex-14', name: 'Hamstring Curl', category: 'Legs', targetSets: 3, targetReps: '12-15' },
  { id: 'd6-ex-4', exerciseId: 'ex-13', name: 'Leg Extension', category: 'Legs', targetSets: 3, targetReps: '12-15' },
  { id: 'd6-ex-5', exerciseId: 'ex-30', name: 'Back Extension (Hyperextension)', category: 'Back', targetSets: 3, targetReps: '12-15' },
  { id: 'd6-ex-6', exerciseId: 'ex-15', name: 'Calf Raises', category: 'Legs', targetSets: 4, targetReps: '15-20' },
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
  history: Record<string, WorkoutLog>
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
              (e) => e.id === ex.id || e.exerciseId === ex.exerciseId
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

export interface GymSettings {
  weightUnit: 'kg' | 'lbs';
  restTimerSeconds: number;
  autoFinishWorkout: boolean;
  showCategoryBadges: boolean;
  defaultTargetSets: number;
}

export const DEFAULT_GYM_SETTINGS: GymSettings = {
  weightUnit: 'kg',
  restTimerSeconds: 60,
  autoFinishWorkout: false,
  showCategoryBadges: true,
  defaultTargetSets: 4,
};

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
  addBodyMetricLog: (log: BodyMetricRow) => Promise<void>;
  deleteBodyMetricLog: (id: string) => Promise<void>;
  setActiveDayIndex: (index: number) => void;
  updateDayTitle: (dayIndex: number, title: string) => void;
  toggleRestDay: (dayIndex: number) => void;
  addExerciseToDay: (dayIndex: number, exercise: Exercise, sets?: number, reps?: string, weight?: string) => void;
  removeExerciseFromDay: (dayIndex: number, planExerciseId: string) => void;
  updatePlanExercise: (dayIndex: number, planExerciseId: string, updates: Partial<PlanExercise>) => void;
  addCustomExercise: (name: string, category: ExerciseCategory, defaultSets?: number, defaultReps?: string) => Exercise;
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
              (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
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


      setActiveDayIndex: (index) => set({ activeDayIndex: index }),



      updateDayTitle: (dayIndex, title) => {
        set((state) => {
          const newPlan = state.weeklyPlan.map((day) =>
            day.dayIndex === dayIndex ? { ...day, title } : day
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
            day.dayIndex === dayIndex ? { ...day, isRestDay: !day.isRestDay } : day
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
              : day
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
              : day
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
                    ex.id === planExerciseId ? { ...ex, ...updates } : ex
                  ),
                }
              : day
          );
          return {
            weeklyPlan: newPlan,
            history: syncUncompletedLogsWithPlan(newPlan, state.history),
          };
        });
      },

      addCustomExercise: (name, category, defaultSets = 3, defaultReps = '10') => {
        const newEx: Exercise = {
          id: `custom-${crypto.randomUUID()}`,
          name,
          category,
          defaultSets,
          defaultReps,
          isCustom: true,
        };
        set((state) => ({ customExercises: [...state.customExercises, newEx] }));
        return newEx;
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
              : day
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
              : day
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
              : day
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
              : day
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
              : day
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
        return get().history[dateStr] || null;
      },

      initializeWorkoutLogForDate: (dateStr, dayIndex) => {
        const state = get();
        const dateObj = new Date(dateStr + 'T00:00:00');
        const jsDay = dateObj.getDay(); // 0 is Sun, 1 is Mon...
        // Map Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
        const mappedDayIndex = dayIndex !== undefined ? dayIndex : (jsDay === 0 ? 6 : jsDay - 1);
        const dayPlan = state.weeklyPlan[mappedDayIndex] || state.weeklyPlan[0];

        const existingLog = state.history[dateStr];
        if (existingLog) {
          // If log exists and is not completed yet, update exercises from the latest dayPlan
          if (!existingLog.completed) {
            const updatedExercises = dayPlan.exercises.map((ex) => {
              const prevEx = existingLog.exercises.find((e) => e.id === ex.id || e.exerciseId === ex.exerciseId);
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

        set((state) => ({
          history: {
            ...state.history,
            [dateStr]: initialLog,
          },
        }));

        return initialLog;
      },

      updateCompletedSet: (dateStr, planExerciseId, deltaSets) => {
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

          const allCompleted = updatedExercises.length > 0 && updatedExercises.every((e) => e.completed);

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
      },

      toggleExerciseDone: (dateStr, planExerciseId) => {
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

          const allCompleted = updatedExercises.length > 0 && updatedExercises.every((e) => e.completed);

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
      },

      finishWorkout: (dateStr, notes) => {
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

