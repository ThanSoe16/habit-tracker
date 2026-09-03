import { supabase } from '@/lib/supabase/client';

export const userService = {
  async fetchProfile() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', 'default_user')
      .single();

    if (error) {
      console.warn('Error fetching user profile from Supabase:', error.message);
      return null;
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
    appearanceSettings?: Record<string, any>;
    homeSettings?: Record<string, any>;
    ringtone?: string;
    customRingtoneUrl?: string;
    vibrationEnabled?: boolean;
    moodSettings?: Record<string, any>;
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
    if (error) console.warn('Error upserting user profile to Supabase:', error.message);
  },
};
