'use client';

import { create } from 'zustand';
import { userService } from '@/features/users/services/supabase';
import { createSaveQueue } from '@/features/settings/save-queue';
import { reportSettingsSync } from '@/features/settings/sync-status';
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
  remindersEnabled: z.boolean(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
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
  remindersEnabled: false,
  reminderTime: '20:00',
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

function writeProfile(state: UserStore) {
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

const profileQueue = createSaveQueue(writeProfile, (status, error) =>
  reportSettingsSync('profile', status, () => profileQueue.retry(), error),
);
const saveProfile = (state: UserStore) => profileQueue.save(state);

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
    if (profileQueue.hasPending) return;
    const revision = profileQueue.revision;
    try {
      const profile = await userService.fetchProfile();
      if (profileQueue.hasPending || revision !== profileQueue.revision) return;
      if (profile) {
        reportSettingsSync('profile', 'idle', () => profileQueue.retry());
        set({
          name: profile.name || 'User',
          avatarEmoji: profile.avatar_emoji || '😊',
          joinedAt: profile.joined_at || new Date().toISOString(),
          remindersEnabled: profile.reminders_enabled ?? false,
          dailyReminderTime: profile.daily_reminder_time || '08:00',
          ringtone: (profile.ringtone as RingtoneType) || 'chime',
          customRingtoneUrl: profile.custom_ringtone_url || undefined,
          vibrationEnabled: profile.vibration_enabled ?? true,
          theme: themeSchema.catch('system').parse(profile.theme),
          appearanceSettings: appearanceSettingsSchema.catch(DEFAULT_APPEARANCE_SETTINGS).parse({
            ...DEFAULT_APPEARANCE_SETTINGS,
            ...(profile.appearance_settings || {}),
          }),
          homeSettings: homeSettingsSchema.catch(DEFAULT_HOME_SETTINGS).parse({
            ...DEFAULT_HOME_SETTINGS,
            ...(profile.home_settings || {}),
          }),
          moodSettings: moodSettingsSchema.catch(DEFAULT_MOOD_SETTINGS).parse({
            ...DEFAULT_MOOD_SETTINGS,
            ...(profile.mood_settings || {}),
          }),
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
        const state = get();
        saveProfile(state);
      }
    } catch (e) {
      reportSettingsSync(
        'profile',
        'error',
        () => {
          void get().fetchFromSupabase();
        },
        e instanceof Error ? e.message : 'Unable to load settings.',
      );
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
