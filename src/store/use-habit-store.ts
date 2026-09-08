'use client';

import { create } from 'zustand';
import { getLocalDateString, isHabitRequiredOnDate } from '@/utils/date-utils';
import habitsApiService from '@/features/habits/services/api';
import { habitsService } from '@/features/habits/services/supabase';
import type {
  Habit,
  HabitFrequency,
  HabitKind,
  ReminderSnoozeMinutes,
} from '@/features/habits/types';

export type {
  Habit,
  HabitFrequency,
  HabitKind,
  ReminderSnoozeMinutes,
} from '@/features/habits/types';

interface HabitStore {
  habits: Habit[];
  customUnits: string[];
  isLoaded: boolean;
  loadError: string | null;
  fetchFromSupabase: () => Promise<void>;
  addCustomUnit: (unitName: string) => void;
  updateCustomUnit: (oldUnit: string, newUnit: string) => void;
  deleteCustomUnit: (unitName: string) => void;
  addHabit: (
    name: string,
    color: string,
    frequency: HabitFrequency,
    repeatDays: number[],
    emoji?: string,
    startDate?: string,
    endDate?: string,
    type?: 'habit' | 'task',
    timeOfDay?: 'morning' | 'afternoon' | 'evening',
    reminderTime?: string,
    endHabitDate?: string,
    endHabitDays?: number,
    specificDates?: string[],
    unitType?: 'simple' | 'duration' | 'time' | 'count',
    goalValue?: number,
    unit?: string,
    timerMode?: 'down' | 'up',
    timeUnit?: 'hr' | 'min' | 'sec',
    habitKind?: HabitKind,
    reminderSnoozeMinutes?: ReminderSnoozeMinutes,
  ) => Promise<Habit>;
  removeHabit: (id: string) => Promise<void>;
  updateHabit: (
    id: string,
    updates: {
      name?: string;
      color?: string;
      frequency?: HabitFrequency;
      repeatDays?: number[];
      emoji?: string;
      createdAt?: string;
      startDate?: string;
      endDate?: string;
      type?: 'habit' | 'task';
      timeOfDay?: 'morning' | 'afternoon' | 'evening';
      reminderTime?: string;
      endHabitDate?: string;
      endHabitDays?: number;
      specificDates?: string[];
      unitType?: 'simple' | 'duration' | 'time' | 'count';
      timerMode?: 'down' | 'up';
      timeUnit?: 'hr' | 'min' | 'sec';
      unit?: string;
      goalValue?: number;
      habitKind?: HabitKind;
      reminderSnoozeMinutes?: ReminderSnoozeMinutes;
    },
  ) => Promise<Habit>;
  reorderHabits: (habits: Habit[]) => void;
  toggleHabit: (
    id: string,
    date: string,
    details?: { completed?: boolean; timeTaken?: string; count?: string; notes?: string },
  ) => void;
  removeCompletion: (id: string, date: string) => void;
}

const calculateStreak = (habit: Habit, history: Habit['history']): number => {
  let streak = 0;
  const todayStr = getLocalDateString();
  const currentDate = new Date();

  while (true) {
    const dateStr = getLocalDateString(currentDate);
    const entry = history[dateStr];
    const isDone = typeof entry === 'boolean' ? entry : entry?.completed;
    const isRequired = isHabitRequiredOnDate(habit, currentDate);

    if (isRequired) {
      if (isDone) {
        streak++;
      } else {
        if (dateStr === todayStr) {
          // Keep going to check yesterday
        } else {
          break;
        }
      }
    }

    currentDate.setDate(currentDate.getDate() - 1);
    if (streak > 366) break;
    if (currentDate.getFullYear() < 2024) break;
  }

  return streak;
};

let pendingWrites = 0;
let writeRevision = 0;

export const useHabitStore = create<HabitStore>()((set, get) => ({
  habits: [],
  customUnits: [],
  isLoaded: false,
  loadError: null,

  fetchFromSupabase: async () => {
    if (pendingWrites > 0) return;
    const revision = writeRevision;
    try {
      const before = get().habits;
      const remoteHabits = await habitsApiService.getHabits();
      const remoteUnits = await habitsService.fetchCustomUnits();
      if (pendingWrites > 0 || revision !== writeRevision) return;

      set((state) => ({
        habits: state.habits === before ? remoteHabits : state.habits,
        customUnits: remoteUnits,
        isLoaded: true,
        loadError: null,
      }));
    } catch (e) {
      console.warn('Failed to fetch habits from Supabase:', e);
      set({ isLoaded: true, loadError: 'Could not load your habits. Please try again.' });
    }
  },

  addCustomUnit: (unitName) => {
    const trimmed = unitName.trim();
    if (!trimmed) return;
    set((state) => ({
      customUnits: state.customUnits.includes(trimmed)
        ? state.customUnits
        : [...state.customUnits, trimmed],
    }));
    habitsService.addCustomUnit(trimmed);
  },

  updateCustomUnit: (oldUnit, newUnit) => {
    const trimmed = newUnit.trim();
    if (!trimmed) return;
    set((state) => ({
      customUnits: state.customUnits.map((u) => (u === oldUnit ? trimmed : u)),
      habits: state.habits.map((h) => (h.unit === oldUnit ? { ...h, unit: trimmed } : h)),
    }));
    habitsService.deleteCustomUnit(oldUnit);
    habitsService.addCustomUnit(trimmed);
    get()
      .habits.filter((habit) => habit.unit === trimmed)
      .forEach((habit) => habitsService.upsertHabit(habit));
  },

  deleteCustomUnit: (unitName) => {
    set((state) => ({
      customUnits: state.customUnits.filter((u) => u !== unitName),
    }));
    habitsService.deleteCustomUnit(unitName);
  },

  addHabit: async (
    name,
    color,
    frequency,
    repeatDays,
    emoji,
    startDate,
    endDate,
    type = 'habit',
    timeOfDay,
    reminderTime,
    endHabitDate,
    endHabitDays,
    specificDates,
    unitType = 'simple',
    goalValue,
    unit,
    timerMode,
    timeUnit,
    habitKind = 'build',
    reminderSnoozeMinutes = 10,
  ) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      color,
      emoji,
      frequency,
      repeatDays,
      startDate,
      endDate,
      type,
      habitKind,
      timeOfDay,
      reminderTime,
      reminderSnoozeMinutes,
      endHabitDate,
      endHabitDays,
      specificDates,
      unitType,
      unit,
      goalValue,
      timerMode,
      timeUnit,
      history: {},
      streak: 0,
      createdAt: new Date().toISOString(),
      sortOrder: get().habits.length,
    };
    pendingWrites++;
    writeRevision++;
    set((state) => ({ habits: [...state.habits, newHabit] }));
    try {
      const saved = await habitsApiService.saveHabit(newHabit);
      set((state) => ({
        habits: state.habits.map((habit) => (habit === newHabit ? saved : habit)),
      }));
      return saved;
    } catch (error) {
      set((state) => ({ habits: state.habits.filter((habit) => habit !== newHabit) }));
      throw error;
    } finally {
      pendingWrites--;
    }
  },

  removeHabit: async (id) => {
    // Keep the record mounted until persistence succeeds so a failed dialog retains context.
    pendingWrites++;
    writeRevision++;
    try {
      await habitsApiService.deleteHabit(id);
      set((state) => ({ habits: state.habits.filter((habit) => habit.id !== id) }));
    } finally {
      pendingWrites--;
    }
  },

  updateHabit: async (id, updates) => {
    const currentHabit = get().habits.find((habit) => habit.id === id);
    if (!currentHabit) throw new Error('This habit is unavailable. Please refresh.');
    const updated = { ...currentHabit, ...updates };
    pendingWrites++;
    writeRevision++;
    set((state) => ({ habits: state.habits.map((habit) => (habit.id === id ? updated : habit)) }));
    try {
      const saved = await habitsApiService.saveHabit(updated);
      set((state) => ({
        habits: state.habits.map((habit) => (habit === updated ? saved : habit)),
      }));
      return saved;
    } catch (error) {
      set((state) => ({
        habits: state.habits.map((habit) => (habit === updated ? currentHabit : habit)),
      }));
      throw error;
    } finally {
      pendingWrites--;
    }
  },

  reorderHabits: (habits) => {
    const reorderedHabits = habits.map((habit, index) => ({
      ...habit,
      sortOrder: index,
    }));
    set({ habits: reorderedHabits });
    reorderedHabits.forEach((habit) => habitsService.upsertHabit(habit));
  },

  toggleHabit: (id, date, details) => {
    set((state) => ({
      habits: state.habits.map((h) => {
        if (h.id !== id) return h;

        const newHistory = { ...h.history };

        if (details) {
          const existingObj = typeof newHistory[date] === 'object' ? (newHistory[date] as any) : {};
          const cleanDetails = Object.fromEntries(
            Object.entries(details).filter(([, value]) => value !== undefined),
          );

          newHistory[date] = {
            completed:
              details.completed !== undefined ? details.completed : !!existingObj.completed,
            ...existingObj,
            ...cleanDetails,
          };
        } else {
          if (newHistory[date]) {
            delete newHistory[date];
          } else {
            newHistory[date] = { completed: true };
          }
        }

        const streak = calculateStreak(h, newHistory);
        const updatedHabit = { ...h, history: newHistory, streak };
        habitsService.upsertHabit(updatedHabit);

        return updatedHabit;
      }),
    }));
  },

  removeCompletion: (id, date) => {
    set((state) => ({
      habits: state.habits.map((h) => {
        if (h.id !== id) return h;

        const newHistory = { ...h.history };
        delete newHistory[date];

        const streak = calculateStreak(h, newHistory);
        const updatedHabit = { ...h, history: newHistory, streak };
        habitsService.upsertHabit(updatedHabit);

        return updatedHabit;
      }),
    }));
  },
}));
