'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLocalDateString, isHabitRequiredOnDate } from '@/utils/date-utils';
import { habitsService } from '@/lib/supabase/services';

export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'specific';

export interface Habit {
  id: string;
  name: string;
  type?: 'habit' | 'task'; // Default to "habit"
  frequency: HabitFrequency;
  repeatDays: number[]; // JS day: 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  color: string;
  emoji?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  reminderTime?: string;
  endHabitDate?: string;
  endHabitDays?: number;
  specificDates?: string[]; // YYYY-MM-DD
  unitType?: 'simple' | 'duration' | 'time' | 'count';
  timerMode?: 'down' | 'up';
  timeUnit?: 'hr' | 'min' | 'sec';
  unit?: string;
  goalValue?: number;
  history: Record<
    string,
    { completed: boolean; timeTaken?: string; count?: string; notes?: string } | boolean
  >; // key is YYYY-MM-DD
  streak: number;
  createdAt: string;
}

interface HabitStore {
  habits: Habit[];
  customUnits: string[];
  isLoaded: boolean;
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
  ) => void;
  removeHabit: (id: string) => void;
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
    },
  ) => void;
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

export const useHabitStore = create<HabitStore>()((set, get) => ({
      habits: [],
      customUnits: [],
      isLoaded: false,

      fetchFromSupabase: async () => {
        try {
          const remoteHabits = await habitsService.fetchHabits();
          const remoteUnits = await habitsService.fetchCustomUnits();
          
          set({
            habits: remoteHabits,
            customUnits: remoteUnits,
            isLoaded: true,
          });
        } catch (e) {
          console.warn('Failed to fetch habits from Supabase:', e);
          set({ isLoaded: true });
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
          timeOfDay,
          reminderTime,
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
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
        await habitsService.upsertHabit(newHabit);
        await get().fetchFromSupabase();
      },

      removeHabit: async (id) => {
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
        await habitsService.deleteHabit(id);
        await get().fetchFromSupabase();
      },

      updateHabit: async (id, updates) => {
        const currentHabit = get().habits.find((h) => h.id === id);
        if (currentHabit) {
          const updated = { ...currentHabit, ...updates };
          set((state) => ({
            habits: state.habits.map((h) => (h.id === id ? updated : h)),
          }));
          await habitsService.upsertHabit(updated);
          await get().fetchFromSupabase();
        }
      },

      reorderHabits: (habits) => {
        set({ habits });
        habits.forEach((h) => habitsService.upsertHabit(h));
      },

      toggleHabit: (id, date, details) => {
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;

            const newHistory = { ...h.history };

            if (details) {
              const existingObj =
                typeof newHistory[date] === 'object' ? (newHistory[date] as any) : {};
              const cleanDetails = Object.fromEntries(
                Object.entries(details).filter(([_, v]) => v !== undefined)
              );

              newHistory[date] = {
                completed: details.completed !== undefined ? details.completed : !!existingObj.completed,
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

