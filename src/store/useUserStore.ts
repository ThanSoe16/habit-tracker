'use client';

import { create } from 'zustand';
import { userService } from '@/lib/supabase/services';

export type Theme = 'light' | 'dark';

export interface HomeSettings {
  homeDefaultView: 'today' | 'weekly' | 'overall';
  cardStyle: 'compact' | 'detailed';
  hideCompleted: boolean;
  sortBy: 'manual' | 'timeOfDay' | 'status' | 'streak' | 'alphabetical';
  groupByTimeOfDay: boolean;
  showProgressBanner: boolean;
  showStreakBadges: boolean;
}

export const DEFAULT_HOME_SETTINGS: HomeSettings = {
  homeDefaultView: 'today',
  cardStyle: 'detailed',
  hideCompleted: false,
  sortBy: 'manual',
  groupByTimeOfDay: false,
  showProgressBanner: true,
  showStreakBadges: true,
};

interface UserStore {
  name: string;
  avatarEmoji: string;
  joinedAt: string;
  remindersEnabled: boolean;
  dailyReminderTime: string; // HH:mm format
  theme: Theme;
  homeSettings: HomeSettings;
  isLoaded: boolean;
  fetchFromSupabase: () => Promise<void>;
  setName: (name: string) => void;
  setAvatarEmoji: (emoji: string) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
  setTheme: (theme: Theme) => void;
  updateHomeSettings: (updates: Partial<HomeSettings>) => void;
}

export const useUserStore = create<UserStore>()((set, get) => ({
  name: 'User',
  avatarEmoji: '😊',
  joinedAt: new Date().toISOString(),
  remindersEnabled: false,
  dailyReminderTime: '08:00',
  theme: 'light' as Theme,
  homeSettings: DEFAULT_HOME_SETTINGS,
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
          homeSettings: {
            ...DEFAULT_HOME_SETTINGS,
            ...(profile.home_settings || {}),
          },
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
          homeSettings: state.homeSettings,
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
      homeSettings: state.homeSettings,
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
      homeSettings: state.homeSettings,
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
      homeSettings: state.homeSettings,
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
      homeSettings: state.homeSettings,
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
      homeSettings: state.homeSettings,
    });
  },

  updateHomeSettings: (updates) => {
    set((state) => {
      const newSettings = { ...state.homeSettings, ...updates };
      userService.upsertProfile({
        name: state.name,
        avatarEmoji: state.avatarEmoji,
        joinedAt: state.joinedAt,
        remindersEnabled: state.remindersEnabled,
        dailyReminderTime: state.dailyReminderTime,
        theme: state.theme,
        homeSettings: newSettings,
      });
      return { homeSettings: newSettings };
    });
  },
}));
