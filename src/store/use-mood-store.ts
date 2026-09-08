'use client';

import { create } from 'zustand';
import { format } from 'date-fns';
import { moodService } from '@/features/mood/services/supabase';

export * from '@/features/mood/types';
import type { MoodEntry } from '@/features/mood/types';

interface MoodStore {
  history: Record<string, MoodEntry>; // Key: YYYY-MM-DD
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
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
  isLoading: false,
  error: null,

  fetchFromSupabase: async () => {
    set({ isLoading: true, error: null });
    try {
      const remoteMoods = await moodService.fetchMoods();
      set({ history: remoteMoods, isLoaded: true, isLoading: false, error: null });
    } catch (e) {
      console.warn('Failed to fetch moods from Supabase:', e);
      set({ isLoading: false, error: 'Could not load your mood history. Please try again.' });
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

    const saved = await moodService.upsertMood(dateKey, entry);
    set((state) => ({
      history: {
        ...state.history,
        [dateKey]: saved,
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
