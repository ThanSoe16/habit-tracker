'use client';

import { createSaveQueue } from '@/features/settings/save-queue';
import { reportSettingsSync } from '@/features/settings/sync-status';
import { create } from 'zustand';
import { gymService } from '@/features/gym/services/supabase';
import type { GymStore } from '@/features/gym/store/types';
import { gymBodyMetricsService } from '@/features/gym/services/body-metrics';
import {
  applyRemoteGymState,
  isApplyingRemoteGymState,
  saveWorkoutLog,
  scheduleGymPlanSave,
} from '@/features/gym/store/gym-sync';
import {
  DEFAULT_DAY1_EXERCISES,
  DEFAULT_DAY2_EXERCISES,
  DEFAULT_DAY3_EXERCISES,
  DEFAULT_DAY5_EXERCISES,
  DEFAULT_DAY6_EXERCISES,
  DEFAULT_INITIAL_PLAN,
} from '@/features/gym/store/presets';
import { syncUncompletedLogsWithPlan } from '@/features/gym/store/workout-plan-sync';
import {
  DEFAULT_GYM_SETTINGS,
  type Exercise,
  type PlanExercise,
  type WorkoutLog,
} from '@/features/gym/store/model';

export * from '@/features/gym/store/model';
export * from '@/features/gym/store/presets';

const gymSettingsQueue = createSaveQueue(gymService.saveGymSettings, (status, error) =>
  reportSettingsSync('workout', status, () => gymSettingsQueue.retry(), error),
);

export const useGymStore = create<GymStore>()((set, get) => ({
  weeklyPlan: DEFAULT_INITIAL_PLAN,
  customExercises: [],
  history: {},
  activeDayIndex: 0,
  gymSettings: DEFAULT_GYM_SETTINGS,
  bodyMetricLogs: [],
  isLoaded: false,

  fetchFromSupabase: async () => {
    const settingsRevision = gymSettingsQueue.revision;
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

      applyRemoteGymState(() => {
        set({
          weeklyPlan: remotePlans.length > 0 ? remotePlans : DEFAULT_INITIAL_PLAN,
          customExercises: remoteCustomEx,
          history: remoteHistory,
          gymSettings: {
            ...DEFAULT_GYM_SETTINGS,
            ...(gymSettingsQueue.hasPending || settingsRevision !== gymSettingsQueue.revision
              ? get().gymSettings
              : remoteSettings || {}),
          },
          bodyMetricLogs: remoteMetrics,
          isLoaded: true,
        });
      });
    } catch (e) {
      reportSettingsSync(
        'workout',
        'error',
        () => {
          void get().fetchFromSupabase();
        },
        e instanceof Error ? e.message : 'Unable to load workout settings.',
      );
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
      gymSettingsQueue.save(newSettings);
      return { gymSettings: newSettings };
    });
  },

  setWeightGoal: (updates) => {
    set((state) => {
      const newSettings = { ...state.gymSettings, ...updates };
      gymSettingsQueue.save(newSettings);
      return { gymSettings: newSettings };
    });
  },

  setHydrationGoal: (goalMl) => {
    set((state) => {
      const newSettings = { ...state.gymSettings, hydrationGoalMl: goalMl };
      gymSettingsQueue.save(newSettings);
      return { gymSettings: newSettings };
    });
  },

  logWaterIntake: (dateStr, deltaMl) => {
    set((state) => {
      const current = state.gymSettings.dailyHydrationLogs[dateStr] || 0;
      const updated = Math.max(0, current + deltaMl);
      const newLogs = { ...state.gymSettings.dailyHydrationLogs, [dateStr]: updated };
      const newSettings = { ...state.gymSettings, dailyHydrationLogs: newLogs };
      gymSettingsQueue.save(newSettings);
      return { gymSettings: newSettings };
    });
  },

  setDailyWaterIntake: (dateStr, totalMl) => {
    set((state) => {
      const newLogs = { ...state.gymSettings.dailyHydrationLogs, [dateStr]: totalMl };
      const newSettings = { ...state.gymSettings, dailyHydrationLogs: newLogs };
      gymSettingsQueue.save(newSettings);
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
      targetSets: sets || exercise.defaultSets || get().gymSettings.defaultTargetSets,
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
            completed: allCompleted && (state.gymSettings.autoFinishWorkout || log.completed),
            completedAt:
              allCompleted && (state.gymSettings.autoFinishWorkout || log.completed)
                ? log.completedAt || new Date().toISOString()
                : undefined,
          },
        },
      };
    });
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
            completed: allCompleted && (state.gymSettings.autoFinishWorkout || log.completed),
            completedAt:
              allCompleted && (state.gymSettings.autoFinishWorkout || log.completed)
                ? log.completedAt || new Date().toISOString()
                : undefined,
          },
        },
      };
    });
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
  if (isApplyingRemoteGymState()) return;

  if (state.weeklyPlan !== previousState.weeklyPlan) {
    const previousPlans = new Map(previousState.weeklyPlan.map((plan) => [plan.dayIndex, plan]));
    state.weeklyPlan.forEach((plan) => {
      const previousPlan = previousPlans.get(plan.dayIndex);
      if (
        !previousPlan ||
        (previousPlan !== plan && JSON.stringify(previousPlan) !== JSON.stringify(plan))
      ) {
        scheduleGymPlanSave(plan);
      }
    });
  }

  if (state.history !== previousState.history) {
    Object.entries(state.history).forEach(([dateKey, log]) => {
      const previousLog = previousState.history[dateKey];
      if (
        !previousLog ||
        (log !== previousLog && JSON.stringify(log) !== JSON.stringify(previousLog))
      ) {
        saveWorkoutLog(dateKey, log);
      }
    });
  }
});
