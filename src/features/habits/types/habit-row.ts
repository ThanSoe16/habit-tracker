import { z } from 'zod';
import { habitKindSchema, reminderSnoozeMinutesSchema, type Habit } from './index';

export const habitRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  emoji: z.string().nullish(),
  frequency: z.string(),
  repeat_days: z.array(z.number()).nullish(),
  type: z.string().nullish(),
  habit_kind: habitKindSchema.nullish(),
  start_date: z.string().nullish(),
  end_date: z.string().nullish(),
  time_of_day: z.string().nullish(),
  reminder_time: z.string().nullish(),
  reminder_snooze_minutes: reminderSnoozeMinutesSchema.nullish(),
  end_habit_date: z.string().nullish(),
  end_habit_days: z.number().nullish(),
  specific_dates: z.array(z.string()).nullish(),
  unit_type: z.string().nullish(),
  unit: z.string().nullish(),
  goal_value: z.number().nullish(),
  timer_mode: z.string().nullish(),
  time_unit: z.string().nullish(),
  history: z
    .record(
      z.union([
        z.boolean(),
        z.object({
          completed: z.boolean(),
          timeTaken: z.string().optional(),
          count: z.string().optional(),
          notes: z.string().optional(),
        }),
      ]),
    )
    .nullish(),
  streak: z.number().nullish(),
  sort_order: z.number().nullish(),
  created_at: z.string().nullish(),
});

export type HabitRow = z.infer<typeof habitRowSchema>;

export function mapHabitRow(value: unknown): Habit {
  const row = habitRowSchema.parse(value);
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    emoji: row.emoji || undefined,
    frequency: (row.frequency || 'daily') as Habit['frequency'],
    repeatDays: row.repeat_days || [],
    type: (row.type || 'habit') as Habit['type'],
    habitKind: row.habit_kind || 'build',
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    timeOfDay: (row.time_of_day || undefined) as Habit['timeOfDay'],
    reminderTime: row.reminder_time || undefined,
    reminderSnoozeMinutes: row.reminder_snooze_minutes || 10,
    endHabitDate: row.end_habit_date || undefined,
    endHabitDays: row.end_habit_days || undefined,
    specificDates: row.specific_dates || undefined,
    unitType: (row.unit_type || 'simple') as Habit['unitType'],
    unit: row.unit || undefined,
    goalValue: row.goal_value || undefined,
    timerMode: (row.timer_mode || undefined) as Habit['timerMode'],
    timeUnit: (row.time_unit || undefined) as Habit['timeUnit'],
    history: row.history || {},
    streak: row.streak || 0,
    createdAt: row.created_at || new Date().toISOString(),
    sortOrder: row.sort_order ?? undefined,
  };
}
