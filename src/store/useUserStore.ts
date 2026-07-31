'use client';

import { create } from 'zustand';
import { userService } from '@/lib/supabase/services';

export type Theme = 'light' | 'dark';

interface UserStore {
  name: string;
  avatarEmoji: string;
  joinedAt: string;
  remindersEnabled: boolean;
  dailyReminderTime: string; // HH:mm format
  theme: Theme;
  isLoaded: boolean;
  fetchFromSupabase: () => Promise<void>;
  setName: (name: string) => void;
  setAvatarEmoji: (emoji: string) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
  setTheme: (theme: Theme) => void;
}

export const useUserStore = create<UserStore>()((set, get) => ({
  name: 'User',
  avatarEmoji: '😊',
  joinedAt: new Date().toISOString(),
  remindersEnabled: false,
  dailyReminderTime: '08:00',
  theme: 'light' as Theme,
  isLoaded: false,

  fetchFromSupabase: async () => {
    try {
      const profile = await userService.fetchProfile();
      if (profile) {
        set({
          name: profile.name || 'User',
          avatarEmoji: profile.avatar_emoji || '😊',
          joinedAt: profile.joined_at || new Date().toISOString(),
          remindersEnabled: profile.reminders_enabled ?? false,
          dailyReminderTime: profile.daily_reminder_time || '08:00',
          theme: (profile.theme as Theme) || 'light',
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
        const state = get();
        userService.upsertProfile({
          name: state.name,
          avatarEmoji: state.avatarEmoji,
          joinedAt: state.joinedAt,
          remindersEnabled: state.remindersEnabled,
          dailyReminderTime: state.dailyReminderTime,
          theme: state.theme,
        });
      }
    } catch (e) {
      console.warn('Failed to fetch profile from Supabase:', e);
      set({ isLoaded: true });
    }
  },

  setName: (name) => {
    set({ name });
    const state = get();
    userService.upsertProfile({
      name,
      avatarEmoji: state.avatarEmoji,
      joinedAt: state.joinedAt,
      remindersEnabled: state.remindersEnabled,
      dailyReminderTime: state.dailyReminderTime,
      theme: state.theme,
    });
  },

  setAvatarEmoji: (emoji) => {
    set({ avatarEmoji: emoji });
    const state = get();
    userService.upsertProfile({
      name: state.name,
      avatarEmoji: emoji,
      joinedAt: state.joinedAt,
      remindersEnabled: state.remindersEnabled,
      dailyReminderTime: state.dailyReminderTime,
      theme: state.theme,
    });
  },

  setRemindersEnabled: (enabled) => {
    set({ remindersEnabled: enabled });
    const state = get();
    userService.upsertProfile({
      name: state.name,
      avatarEmoji: state.avatarEmoji,
      joinedAt: state.joinedAt,
      remindersEnabled: enabled,
      dailyReminderTime: state.dailyReminderTime,
      theme: state.theme,
    });
  },

  setDailyReminderTime: (time) => {
    set({ dailyReminderTime: time });
    const state = get();
    userService.upsertProfile({
      name: state.name,
      avatarEmoji: state.avatarEmoji,
      joinedAt: state.joinedAt,
      remindersEnabled: state.remindersEnabled,
      dailyReminderTime: time,
      theme: state.theme,
    });
  },

  setTheme: (theme) => {
    set({ theme });
    const state = get();
    userService.upsertProfile({
      name: state.name,
      avatarEmoji: state.avatarEmoji,
      joinedAt: state.joinedAt,
      remindersEnabled: state.remindersEnabled,
      dailyReminderTime: state.dailyReminderTime,
      theme,
    });
  },
}));
