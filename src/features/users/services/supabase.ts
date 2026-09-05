import { supabase } from '@/lib/supabase/client';

export const userService = {
  async fetchProfile() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', 'default_user')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  async upsertProfile(profile: {
    name: string;
    avatarEmoji: string;
    joinedAt: string;
    remindersEnabled: boolean;
    dailyReminderTime: string;
    theme: 'light' | 'dark' | 'system';
    appearanceSettings?: Record<string, unknown>;
    homeSettings?: Record<string, unknown>;
    ringtone?: string;
    customRingtoneUrl?: string;
    vibrationEnabled?: boolean;
    moodSettings?: Record<string, unknown>;
  }) {
    const payload = {
      id: 'default_user',
      name: profile.name,
      avatar_emoji: profile.avatarEmoji,
      joined_at: profile.joinedAt,
      reminders_enabled: profile.remindersEnabled,
      daily_reminder_time: profile.dailyReminderTime,
      theme: profile.theme,
      appearance_settings: profile.appearanceSettings || {},
      home_settings: profile.homeSettings,
      ringtone: profile.ringtone || 'chime',
      custom_ringtone_url: profile.customRingtoneUrl || null,
      vibration_enabled: profile.vibrationEnabled ?? true,
      mood_settings: profile.moodSettings || {},
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('user_profiles').upsert(payload, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  },
};
