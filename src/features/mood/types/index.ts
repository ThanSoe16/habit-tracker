import { z } from 'zod';

export const moodEntrySchema = z.object({
  mood: z.string(),
  label: z.string(),
  emoji: z.string(),
  tag: z.string().optional(),
  note: z.string().optional(),
  timestamp: z.string(),
});

export type MoodEntry = z.infer<typeof moodEntrySchema>;

export const moodRowSchema = moodEntrySchema.extend({
  date_key: z.string().date(),
  tag: z.string().nullish(),
  note: z.string().nullish(),
  timestamp: z.string().nullable(),
});
