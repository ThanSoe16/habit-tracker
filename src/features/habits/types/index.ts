import { z } from 'zod';
import { Habit } from '@/store/use-habit-store';

export interface HabitFilterParams {
  type?: 'habit' | 'task';
  search?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'specific';
}

export const habitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string(),
  emoji: z.string(),
  startDate: z.string(),
  type: z.enum(['habit', 'task']),
  frequencyTab: z.enum(['daily', 'monthly', 'specific']),
  selectedDays: z.array(z.number()),
  selectedMonthlyDays: z.array(z.number()),
  selectedSpecificDates: z.array(z.string()),
  allDay: z.boolean(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
  endHabitEnabled: z.boolean(),
  endHabitMode: z.enum(['date', 'days']),
  endHabitDate: z.string(),
  endHabitDays: z.number(),
  reminders: z.boolean(),
  reminderTime: z.string(),
  unitType: z.enum(['simple', 'duration', 'time', 'count']),
  timerMode: z.enum(['down', 'up']).optional(),
  timeUnit: z.enum(['hr', 'min', 'sec']).optional(),
  unit: z.string().optional(),
  goalValue: z.number().min(1, 'Goal value must be at least 1'),
});

export type HabitData = z.infer<typeof habitSchema>;
export type { Habit };
