import { z } from 'zod';
import { calculateHabitDurationDays } from '@/utils/habit-end-condition';

export const habitFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'specific']);
export const habitKindSchema = z.enum(['build', 'quit']);
export const reminderSnoozeMinutesSchema = z.union([
  z.literal(5),
  z.literal(10),
  z.literal(15),
  z.literal(30),
]);

export const habitFilterSchema = z.object({
  type: z.enum(['habit', 'task']).optional(),
  habitKind: habitKindSchema.optional(),
  search: z.string().trim().optional(),
  frequency: habitFrequencySchema.optional(),
});

const habitCompletionSchema = z.object({
  completed: z.boolean(),
  timeTaken: z.string().optional(),
  count: z.string().optional(),
  notes: z.string().optional(),
});

export const habitRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  type: z.enum(['habit', 'task']).optional(),
  habitKind: habitKindSchema.optional(),
  frequency: habitFrequencySchema,
  repeatDays: z.array(z.number().int().min(0).max(6)),
  color: z.string().min(1),
  emoji: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']).optional(),
  reminderTime: z.string().optional(),
  reminderSnoozeMinutes: reminderSnoozeMinutesSchema.optional(),
  endHabitDate: z.string().optional(),
  endHabitDays: z.number().int().positive().optional(),
  specificDates: z.array(z.string()).optional(),
  unitType: z.enum(['simple', 'duration', 'time', 'count']).optional(),
  timerMode: z.enum(['down', 'up']).optional(),
  timeUnit: z.enum(['hr', 'min', 'sec']).optional(),
  unit: z.string().optional(),
  goalValue: z.number().positive().optional(),
  history: z.record(z.union([habitCompletionSchema, z.boolean()])),
  streak: z.number().int().nonnegative(),
  createdAt: z.string(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const habitSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    color: z.string(),
    emoji: z.string(),
    startDate: z.string(),
    type: z.enum(['habit', 'task']),
    habitKind: habitKindSchema,
    frequencyTab: z.enum(['daily', 'monthly', 'specific']),
    selectedDays: z.array(z.number()),
    selectedMonthlyDays: z.array(z.number()),
    selectedSpecificDates: z.array(z.string()),
    allDay: z.boolean(),
    timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
    endHabitEnabled: z.boolean(),
    endHabitMode: z.enum(['date', 'days']),
    endHabitDate: z.string(),
    endHabitDays: z.number().int().min(1, 'Duration must be at least 1 day'),
    reminders: z.boolean(),
    reminderTime: z.string(),
    reminderSnoozeMinutes: reminderSnoozeMinutesSchema,
    unitType: z.enum(['simple', 'duration', 'time', 'count']),
    timerMode: z.enum(['down', 'up']).optional(),
    timeUnit: z.enum(['hr', 'min', 'sec']).optional(),
    unit: z.string().optional(),
    goalValue: z.number().min(1, 'Goal value must be at least 1'),
  })
  .superRefine((data, context) => {
    if (!data.endHabitEnabled) return;

    if (calculateHabitDurationDays(data.startDate, data.endHabitDate) < 1) {
      context.addIssue({
        code: 'custom',
        path: ['endHabitDate'],
        message: 'End date must be on or after the start date',
      });
    }
  });

export type HabitData = z.infer<typeof habitSchema>;
export type HabitFrequency = z.infer<typeof habitFrequencySchema>;
export type HabitKind = z.infer<typeof habitKindSchema>;
export type ReminderSnoozeMinutes = z.infer<typeof reminderSnoozeMinutesSchema>;
export type HabitFilterParams = z.infer<typeof habitFilterSchema>;
export type Habit = z.infer<typeof habitRecordSchema>;
