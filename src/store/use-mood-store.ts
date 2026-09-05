'use client';

import { create } from 'zustand';
import { format } from 'date-fns';
import { moodService } from '@/features/mood/services/supabase';
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

interface MoodStore {
  history: Record<string, MoodEntry>; // Key: YYYY-MM-DD
  isLoaded: boolean;
  fetchFromSupabase: () => Promise<void>;
  setMood: (
    date: Date,
    mood: { label: string; emoji: string },
    tag?: string,
    note?: string,
  ) => Promise<void>;
  clearHistory: () => Promise<void>;
  getMood: (date: Date) => MoodEntry | null;
}

export const MOODS = [
  { label: 'Great', emoji: '😎', color: '#818CF8' },
  { label: 'Good', emoji: '😊', color: '#FBBF24' },
  { label: 'Okay', emoji: '😐', color: '#94A3B8' },
  { label: 'Not Good', emoji: '😢', color: '#FB7185' },
  { label: 'Bad', emoji: '😡', color: '#EF4444' },
];

export const useMoodStore = create<MoodStore>()((set, get) => ({
  history: {},
  isLoaded: false,

  fetchFromSupabase: async () => {
    try {
      const remoteMoods = await moodService.fetchMoods();
      set({ history: remoteMoods, isLoaded: true });
    } catch (e) {
      console.warn('Failed to fetch moods from Supabase:', e);
      set({ isLoaded: true });
    }
  },

  setMood: async (date, mood, tag, note) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const entry: MoodEntry = {
      mood: mood.label,
      label: mood.label,
      emoji: mood.emoji,
      tag,
      note:
        note?.trim() || get().history[dateKey]?.note !== undefined
          ? (note ?? get().history[dateKey]?.note)
          : undefined,
      timestamp: new Date().toISOString(),
    };

    await moodService.upsertMood(dateKey, entry);
    set((state) => ({
      history: {
        ...state.history,
        [dateKey]: entry,
      },
    }));
  },

  clearHistory: async () => {
    await moodService.deleteAllMoods();
    set({ history: {} });
  },

  getMood: (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return get().history[dateKey] || null;
  },
}));
