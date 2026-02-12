'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export interface MoodEntry {
  mood: string;
  label: string;
  emoji: string;
  tag?: string;
  timestamp: string;
}

interface MoodStore {
  history: Record<string, MoodEntry>; // Key: YYYY-MM-DD
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

export const useMoodStore = create<MoodStore>()(
  persist(
    (set, get) => ({
      history: {},
      setMood: (date, mood, tag) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        set((state) => ({
          history: {
            ...state.history,
            [dateKey]: {
              mood: mood.label,
              label: mood.label,
              emoji: mood.emoji,
              tag,
              timestamp: new Date().toISOString(),
            },
          },
        }));
      },
      getMood: (date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return get().history[dateKey] || null;
      },
    }),
    {
      name: 'mood-tracker-storage',
    },
  ),
);
