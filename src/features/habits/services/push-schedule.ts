import { calculateHabitEndDate } from '@/utils/habit-end-condition';
import { normalize24HourTime } from '@/utils/time-utils';
import type { HabitRow } from './supabase';
import { z } from 'zod';

const zonedDatePartsSchema = z.object({
  date: z.string(),
  time: z.string(),
  dayOfMonth: z.number().int().min(1).max(31),
  dayOfWeek: z.number().int().min(0).max(6),
});

export type ZonedDateParts = z.infer<typeof zonedDatePartsSchema>;

const getDateInTimezone = (date: Date, timezone: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

export const getZonedDateParts = (date: Date, timezone: string): ZonedDateParts => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const localDate = `${values.year}-${values.month}-${values.day}`;

  return zonedDatePartsSchema.parse({
    date: localDate,
    time: `${values.hour}:${values.minute}`,
    dayOfMonth: Number(values.day),
    dayOfWeek: new Date(`${localDate}T12:00:00Z`).getUTCDay(),
  });
};

export const isHabitScheduledForDate = (
  habit: HabitRow,
  zonedDate: ZonedDateParts,
  timezone: string,
) => {
  const createdDate = habit.created_at
    ? getDateInTimezone(new Date(habit.created_at), timezone)
    : zonedDate.date;
  const startDate = habit.start_date || createdDate;

  if (habit.type === 'task') return zonedDate.date === startDate;
  if (zonedDate.date < startDate) return false;

  const endDate =
    habit.end_habit_date ||
    (habit.end_habit_days
      ? calculateHabitEndDate(startDate, habit.end_habit_days)
      : habit.end_date);
  if (endDate && zonedDate.date > endDate) return false;

  if (habit.frequency === 'specific') {
    return habit.specific_dates?.includes(zonedDate.date) || false;
  }
  if (habit.frequency === 'monthly') {
    return habit.repeat_days?.includes(zonedDate.dayOfMonth) || false;
  }
  if (!habit.repeat_days?.length) return zonedDate.date === startDate;

  return habit.repeat_days.includes(zonedDate.dayOfWeek);
};

export const isHabitReminderDue = (habit: HabitRow, zonedDate: ZonedDateParts) => {
  if (!habit.reminder_time) return false;
  return normalize24HourTime(habit.reminder_time) === zonedDate.time;
};

export const isHabitCompleted = (habit: HabitRow, date: string) => {
  const entry = habit.history?.[date];
  return typeof entry === 'boolean' ? entry : Boolean(entry?.completed);
};
