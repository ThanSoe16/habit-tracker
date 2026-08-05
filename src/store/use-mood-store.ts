'use client';

import { create } from 'zustand';
import { format } from 'date-fns';
import { moodService } from '@/lib/supabase/services';

export interface MoodEntry {
  mood: string;
  label: string;
  emoji: string;
  tag?: string;
  timestamp: string;
}

interface MoodStore {
  history: Record<string, MoodEntry>; // Key: YYYY-MM-DD
  isLoaded: boolean;
  fetchFromSupabase: () => Promise<void>;
  setMood: (date: Date, mood: { label: string; emoji: string }, tag?: string) => void;
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

  setMood: (date, mood, tag) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const entry: MoodEntry = {
      mood: mood.label,
      label: mood.label,
      emoji: mood.emoji,
      tag,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      history: {
        ...state.history,
        [dateKey]: entry,
      },
    }));

    moodService.upsertMood(dateKey, entry);
  },

  getMood: (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return get().history[dateKey] || null;
  },
}));
