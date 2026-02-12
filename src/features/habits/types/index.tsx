import { z } from 'zod';

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
});

export type HabitData = z.infer<typeof habitSchema>;
