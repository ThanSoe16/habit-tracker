import { z } from 'zod';

const STORAGE_KEY = 'habit-reminder-snoozes';

const snoozeMapSchema = z.record(z.number());
type SnoozeMap = z.infer<typeof snoozeMapSchema>;

const createKey = (habitId: string, date: string) => `${habitId}:${date}`;

const readSnoozes = (): SnoozeMap => {
  if (typeof window === 'undefined') return {};

  try {
    const result = snoozeMapSchema.safeParse(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    return result.success ? result.data : {};
  } catch {
    return {};
  }
};

export const getHabitSnoozedUntil = (habitId: string, date: string) =>
  readSnoozes()[createKey(habitId, date)];

export const snoozeHabitReminder = (habitId: string, date: string, minutes: number) => {
  const snoozes = readSnoozes();
  snoozes[createKey(habitId, date)] = Date.now() + minutes * 60_000;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snoozes));
};

export const clearHabitSnooze = (habitId: string, date: string) => {
  const snoozes = readSnoozes();
  delete snoozes[createKey(habitId, date)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snoozes));
};
