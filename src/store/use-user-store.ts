'use client';

import { create } from 'zustand';
import { userService } from '@/features/users/services/supabase';
import { z } from 'zod';

export const themeSchema = z.enum(['light', 'dark', 'system']);
export const accentColorSchema = z.enum(['orange', 'indigo', 'emerald', 'rose', 'violet']);
export const interfaceDensitySchema = z.enum(['comfortable', 'compact']);

export type Theme = z.infer<typeof themeSchema>;
export type AccentColor = z.infer<typeof accentColorSchema>;
export type InterfaceDensity = z.infer<typeof interfaceDensitySchema>;

export const appearanceSettingsSchema = z.object({
  accentColor: accentColorSchema,
  density: interfaceDensitySchema,
  reduceMotion: z.boolean(),
});

export const homeSettingsSchema = z.object({
  homeDefaultView: z.enum(['today', 'weekly', 'overall']),
  cardStyle: z.enum(['compact', 'detailed']),
  hideCompleted: z.boolean(),
  sortBy: z.enum(['manual', 'timeOfDay', 'status', 'streak', 'alphabetical']),
  groupByTimeOfDay: z.boolean(),
  showProgressBanner: z.boolean(),
  showStreakBadges: z.boolean(),
});

export const moodSettingsSchema = z.object({
  enableNotes: z.boolean(),
  showStreak: z.boolean(),
});

export type AppearanceSettings = z.infer<typeof appearanceSettingsSchema>;
export type HomeSettings = z.infer<typeof homeSettingsSchema>;
export type MoodSettings = z.infer<typeof moodSettingsSchema>;

export const DEFAULT_HOME_SETTINGS: HomeSettings = {
  homeDefaultView: 'today',
  cardStyle: 'detailed',
  hideCompleted: false,
  sortBy: 'manual',
  groupByTimeOfDay: false,
  showProgressBanner: true,
  showStreakBadges: true,
};

export const DEFAULT_MOOD_SETTINGS: MoodSettings = {
  enableNotes: true,
  showStreak: true,
};

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  accentColor: 'orange',
  density: 'comfortable',
  reduceMotion: false,
};

export const ringtoneTypeSchema = z.enum(['chime', 'marimba', 'radar', 'digital', 'custom']);
export type RingtoneType = z.infer<typeof ringtoneTypeSchema>;

interface UserStore {
  name: string;
  avatarEmoji: string;
  joinedAt: string;
  remindersEnabled: boolean;
  dailyReminderTime: string; // HH:mm format
  ringtone: RingtoneType;
  customRingtoneUrl?: string;
  vibrationEnabled: boolean;
  theme: Theme;
  appearanceSettings: AppearanceSettings;
  homeSettings: HomeSettings;
  moodSettings: MoodSettings;
  isLoaded: boolean;
  fetchFromSupabase: () => Promise<void>;
  setName: (name: string) => void;
  setAvatarEmoji: (emoji: string) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
  setRingtone: (ringtone: RingtoneType, customUrl?: string) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  updateMoodSettings: (updates: Partial<MoodSettings>) => void;
  setTheme: (theme: Theme) => void;
  updateAppearanceSettings: (updates: Partial<AppearanceSettings>) => void;
  updateHomeSettings: (updates: Partial<HomeSettings>) => void;
}

function saveProfile(state: UserStore) {
  return userService.upsertProfile({
    name: state.name,
    avatarEmoji: state.avatarEmoji,
    joinedAt: state.joinedAt,
    remindersEnabled: state.remindersEnabled,
    dailyReminderTime: state.dailyReminderTime,
    ringtone: state.ringtone,
    customRingtoneUrl: state.customRingtoneUrl,
    vibrationEnabled: state.vibrationEnabled,
    theme: state.theme,
    appearanceSettings: state.appearanceSettings,
    homeSettings: state.homeSettings,
    moodSettings: state.moodSettings,
  });
}

export const useUserStore = create<UserStore>()((set, get) => ({
  name: 'User',
  avatarEmoji: '😊',
  joinedAt: new Date().toISOString(),
  remindersEnabled: true,
  dailyReminderTime: '08:00',
  ringtone: 'chime' as RingtoneType,
  customRingtoneUrl: undefined,
  vibrationEnabled: true,
  theme: 'system' as Theme,
  appearanceSettings: DEFAULT_APPEARANCE_SETTINGS,
  homeSettings: DEFAULT_HOME_SETTINGS,
  moodSettings: DEFAULT_MOOD_SETTINGS,
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
          ringtone: (profile.ringtone as RingtoneType) || 'chime',
          customRingtoneUrl: profile.custom_ringtone_url || undefined,
          vibrationEnabled: profile.vibration_enabled ?? true,
          theme: (profile.theme as Theme) || 'light',
          appearanceSettings: {
            ...DEFAULT_APPEARANCE_SETTINGS,
            ...(profile.appearance_settings || {}),
          },
          homeSettings: {
            ...DEFAULT_HOME_SETTINGS,
            ...(profile.home_settings || {}),
          },
          moodSettings: {
            ...DEFAULT_MOOD_SETTINGS,
            ...(profile.mood_settings || {}),
          },
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
        const state = get();
        saveProfile(state);
      }
    } catch (e) {
      console.warn('Failed to fetch profile from Supabase:', e);
      set({ isLoaded: true });
    }
  },

  setName: (name) => {
    set({ name });
    saveProfile(get());
  },

  setAvatarEmoji: (emoji) => {
    set({ avatarEmoji: emoji });
    saveProfile(get());
  },

  setRemindersEnabled: (enabled) => {
    set({ remindersEnabled: enabled });
    saveProfile(get());
  },

  setDailyReminderTime: (time) => {
    set({ dailyReminderTime: time });
    saveProfile(get());
  },

  setRingtone: (ringtone, customUrl) => {
    set({ ringtone, customRingtoneUrl: customUrl });
    saveProfile(get());
  },

  setVibrationEnabled: (enabled) => {
    set({ vibrationEnabled: enabled });
    saveProfile(get());
  },

  updateMoodSettings: (updates) => {
    set((state) => ({ moodSettings: { ...state.moodSettings, ...updates } }));
    saveProfile(get());
  },

  setTheme: (theme) => {
    set({ theme });
    saveProfile(get());
  },

  updateAppearanceSettings: (updates) => {
    set((state) => ({
      appearanceSettings: { ...state.appearanceSettings, ...updates },
    }));
    saveProfile(get());
  },

  updateHomeSettings: (updates) => {
    set((state) => ({ homeSettings: { ...state.homeSettings, ...updates } }));
    saveProfile(get());
  },
}));
