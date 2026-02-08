"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalDateString, isHabitRequiredOnDate } from "@/utils/dateUtils";

export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface Habit {
  id: string;
  name: string;
  frequency: HabitFrequency;
  repeatDays: number[]; // JS day: 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  color: string;
  emoji?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  history: Record<
    string,
    { completed: boolean; timeTaken?: string; notes?: string } | boolean
  >; // key is YYYY-MM-DD
  streak: number;
  createdAt: string;
}

interface HabitStore {
  habits: Habit[];
  isLoaded: boolean;
  addHabit: (
    name: string,
    color: string,
    frequency: HabitFrequency,
    repeatDays: number[],
    emoji?: string,
    startDate?: string,
    endDate?: string,
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
    },
  ) => void;
  toggleHabit: (
    id: string,
    date: string,
    details?: { timeTaken?: string; notes?: string },
  ) => void;
  removeCompletion: (id: string, date: string) => void;
}

const calculateStreak = (habit: Habit, history: Habit["history"]): number => {
  let streak = 0;
  const todayStr = getLocalDateString();
  const currentDate = new Date(); // Start from today locally

  // Check backwards
  while (true) {
    const dateStr = getLocalDateString(currentDate);
    const entry = history[dateStr];
    const isDone = typeof entry === "boolean" ? entry : entry?.completed;

    const isRequired = isHabitRequiredOnDate(habit.repeatDays, currentDate);

    if (isRequired) {
      if (isDone) {
        streak++;
      } else {
        // If it's today and not done yet, don't break the streak (it continues from yesterday)
        if (dateStr === todayStr) {
          // Keep going to check yesterday
        } else {
          // Required day missed in the past, break streak
          break;
        }
      }
    } else {
      // Not a required day, just keep going
    }

    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1);

    // Safety break: don't look back more than a year (or some reasonable limit)
    // Or just break if we reach habit creation date (if we had it as a Date object)
    if (streak > 366) break;

    // Also break if we go way before the habit was created (optional optimization)
    // For now, let's keep it simple but safe.
    if (currentDate.getFullYear() < 2024) break;
  }

  return streak;
};

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      isLoaded: true,

      addHabit: (
        name,
        color,
        frequency,
        repeatDays,
        emoji,
        startDate,
        endDate,
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
          history: {},
          streak: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },

      removeHabit: (id) => {
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h,
          ),
        }));
      },

      toggleHabit: (id, date, details) => {
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;

            const newHistory = { ...h.history };

            // If details are provided, we are "finishing" or updating a completed habit
            if (details) {
              newHistory[date] = { completed: true, ...details };
            } else {
              // Simple toggle (legacy behavior)
              if (newHistory[date]) {
                delete newHistory[date];
              } else {
                newHistory[date] = { completed: true };
              }
            }

            // Recalculate streak
            const streak = calculateStreak(h, newHistory);

            return { ...h, history: newHistory, streak };
          }),
        }));
      },

      removeCompletion: (id, date) => {
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;

            const newHistory = { ...h.history };
            delete newHistory[date];

            // Recalculate streak
            const streak = calculateStreak(h, newHistory);

            return { ...h, history: newHistory, streak };
          }),
        }));
      },
    }),
    {
      name: "habit-tracker-data",
    },
  ),
);
