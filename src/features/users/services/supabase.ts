import { durableMediaTree, resolveMediaTree } from '@/lib/supabase/private-media';
import { DataRequestError } from '@/lib/supabase/request';
import { accountService } from '@/lib/supabase/account-client';

export const userService = {
  async fetchProfile() {
    const { supabase, userId } = await accountService.getClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        'id, name, avatar_emoji, joined_at, reminders_enabled, daily_reminder_time, theme, appearance_settings, home_settings, ringtone, custom_ringtone_url, vibration_enabled, mood_settings',
      )
      .in('id', ['default_user', userId])
      .limit(2);

    if (error) {
      throw new DataRequestError('Could not sync your profile. Please try again.', error);
    }
    return resolveMediaTree(
      supabase,
      data?.find((row) => row.id === 'default_user') ?? data?.[0] ?? null,
    );
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
    const { supabase, userId } = await accountService.getClient();
    const payload = {
      user_id: userId,
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
    const { error } = await supabase
      .from('user_profiles')
      .upsert(durableMediaTree(supabase, payload), { onConflict: 'user_id,id' });
    if (error) throw new DataRequestError('Could not sync your profile. Please try again.', error);
  },
};
