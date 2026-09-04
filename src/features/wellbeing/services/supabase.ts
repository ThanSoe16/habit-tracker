import { supabase } from '@/lib/supabase/client';
import type { SocialSession, SocialUrge } from '@/store/use-digital-wellbeing-store';
import type {
  DigitalWellbeingAppLimitRow,
  DigitalWellbeingAppUsageRow,
  DigitalWellbeingBedtimeSettingsRow,
  DigitalWellbeingChallengeRow,
  DigitalWellbeingDailyUsageRow,
  DigitalWellbeingFocusSessionAppRow,
  DigitalWellbeingFocusSessionRow,
  DigitalWellbeingInsightRow,
  DigitalWellbeingSettingsRow,
  DigitalWellbeingUserChallengeRow,
} from '../types/database';

interface WellbeingData {
  dailyLimitMinutes: number | null;
  reminderIntervalMinutes: number | null;
  sessions: SocialSession[];
  urges: SocialUrge[];
}

async function getUserId() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

async function requireUserId() {
  const userId = await getUserId();
  if (!userId) throw new Error('You must be signed in to use Digital Wellbeing.');
  return userId;
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export interface WellbeingDashboardRows {
  dailyUsage: DigitalWellbeingDailyUsageRow[];
  appUsage: DigitalWellbeingAppUsageRow[];
  appLimits: DigitalWellbeingAppLimitRow[];
  focusSessions: DigitalWellbeingFocusSessionRow[];
  focusSessionApps: DigitalWellbeingFocusSessionAppRow[];
  challenges: DigitalWellbeingChallengeRow[];
  userChallenges: DigitalWellbeingUserChallengeRow[];
  settings: DigitalWellbeingSettingsRow | null;
  bedtime: DigitalWellbeingBedtimeSettingsRow | null;
  insights: DigitalWellbeingInsightRow[];
}

export const digitalWellbeingService = {
  async fetchDashboard(): Promise<WellbeingDashboardRows> {
    const userId = await requireUserId();
    const results = await Promise.all([
      supabase.from('digital_wellbeing_daily_usage').select('*').eq('user_id', userId).order('usage_date'),
      supabase.from('digital_wellbeing_app_usage').select('*').eq('user_id', userId).order('usage_date'),
      supabase.from('digital_wellbeing_app_limits').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('digital_wellbeing_focus_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false }),
      supabase.from('digital_wellbeing_focus_session_apps').select('*'),
      supabase.from('digital_wellbeing_challenges').select('*').eq('is_active', true).order('created_at'),
      supabase.from('digital_wellbeing_user_challenges').select('*').eq('user_id', userId).order('started_at', { ascending: false }),
      supabase.from('digital_wellbeing_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('digital_wellbeing_bedtime_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('digital_wellbeing_insights').select('*').eq('user_id', userId).order('insight_date', { ascending: false }),
    ]);
    results.forEach(({ error }) => throwIfError(error));

    return {
      dailyUsage: (results[0].data ?? []) as DigitalWellbeingDailyUsageRow[],
      appUsage: (results[1].data ?? []) as DigitalWellbeingAppUsageRow[],
      appLimits: (results[2].data ?? []) as DigitalWellbeingAppLimitRow[],
      focusSessions: (results[3].data ?? []) as DigitalWellbeingFocusSessionRow[],
      focusSessionApps: (results[4].data ?? []) as DigitalWellbeingFocusSessionAppRow[],
      challenges: (results[5].data ?? []) as DigitalWellbeingChallengeRow[],
      userChallenges: (results[6].data ?? []) as DigitalWellbeingUserChallengeRow[],
      settings: results[7].data as DigitalWellbeingSettingsRow | null,
      bedtime: results[8].data as DigitalWellbeingBedtimeSettingsRow | null,
      insights: (results[9].data ?? []) as DigitalWellbeingInsightRow[],
    };
  },

  async upsertAppLimit(input: Pick<DigitalWellbeingAppLimitRow, 'app_identifier' | 'app_name' | 'daily_limit_seconds' | 'warning_before_seconds' | 'is_enabled'>) {
    const userId = await requireUserId();
    const { error } = await supabase.from('digital_wellbeing_app_limits').upsert(
      { ...input, user_id: userId },
      { onConflict: 'user_id,app_identifier' },
    );
    throwIfError(error);
  },

  async deleteAppLimit(id: string) {
    const userId = await requireUserId();
    const { error } = await supabase.from('digital_wellbeing_app_limits').delete().eq('id', id).eq('user_id', userId);
    throwIfError(error);
  },

  async startFocusSession(id: string, startedAt: string, plannedDurationSeconds: number, apps: string[]) {
    const userId = await requireUserId();
    const sessionResult = await supabase.from('digital_wellbeing_focus_sessions').insert({
      id, user_id: userId, started_at: startedAt, planned_duration_seconds: plannedDurationSeconds,
      completed_duration_seconds: 0, status: 'ACTIVE', pause_count: 0,
    });
    throwIfError(sessionResult.error);
    if (apps.length) {
      const { error } = await supabase.from('digital_wellbeing_focus_session_apps').insert(apps.map((app) => ({
        focus_session_id: id,
        app_identifier: app.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'),
        app_name: app,
      })));
      throwIfError(error);
    }
  },

  async updateFocusSession(id: string, input: { status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'; plannedDurationSeconds: number; completedDurationSeconds: number; pauseCount: number; endedAt?: string | null }) {
    const userId = await requireUserId();
    const { error } = await supabase.from('digital_wellbeing_focus_sessions').update({
      status: input.status,
      planned_duration_seconds: input.plannedDurationSeconds,
      completed_duration_seconds: input.completedDurationSeconds,
      pause_count: input.pauseCount,
      ended_at: input.endedAt,
    }).eq('id', id).eq('user_id', userId);
    throwIfError(error);
  },

  async startChallenge(challenge: DigitalWellbeingChallengeRow) {
    const userId = await requireUserId();
    const existing = await supabase.from('digital_wellbeing_user_challenges').select('id').eq('user_id', userId).eq('challenge_id', challenge.id).order('started_at', { ascending: false }).limit(1).maybeSingle();
    throwIfError(existing.error);
    const startedAt = new Date();
    const payload = {
      user_id: userId,
      challenge_id: challenge.id,
      started_at: startedAt.toISOString(),
      ended_at: null,
      completed_at: null,
      current_value: 0,
      target_value: challenge.target_value ?? 0,
      status: 'ACTIVE',
    };
    const query = existing.data
      ? supabase.from('digital_wellbeing_user_challenges').update(payload).eq('id', existing.data.id).eq('user_id', userId)
      : supabase.from('digital_wellbeing_user_challenges').insert(payload);
    const { error } = await query;
    throwIfError(error);
  },

  async cancelChallenge(id: string) {
    const userId = await requireUserId();
    const { error } = await supabase.from('digital_wellbeing_user_challenges').update({ status: 'CANCELLED', ended_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
    throwIfError(error);
  },

  async upsertSettings(input: Partial<DigitalWellbeingSettingsRow>) {
    const userId = await requireUserId();
    const values = { ...input };
    delete values.id;
    delete values.created_at;
    delete values.updated_at;
    delete values.user_id;
    const { error } = await supabase.from('digital_wellbeing_settings').upsert(
      { ...values, user_id: userId },
      { onConflict: 'user_id' },
    );
    throwIfError(error);
  },

  async upsertBedtime(input: Partial<DigitalWellbeingBedtimeSettingsRow>) {
    const userId = await requireUserId();
    const values = { ...input };
    delete values.id;
    delete values.created_at;
    delete values.updated_at;
    delete values.user_id;
    const { error } = await supabase.from('digital_wellbeing_bedtime_settings').upsert(
      { ...values, user_id: userId },
      { onConflict: 'user_id' },
    );
    throwIfError(error);
  },

  async deleteHistory() {
    const userId = await requireUserId();
    const results = await Promise.all([
      supabase.from('digital_wellbeing_daily_usage').delete().eq('user_id', userId),
      supabase.from('digital_wellbeing_app_usage').delete().eq('user_id', userId),
      supabase.from('digital_wellbeing_focus_sessions').delete().eq('user_id', userId),
      supabase.from('digital_wellbeing_insights').delete().eq('user_id', userId),
      supabase.from('social_media_sessions').delete().eq('user_id', userId),
      supabase.from('social_media_urges').delete().eq('user_id', userId),
    ]);
    results.forEach(({ error }) => throwIfError(error));
  },
};

export const wellbeingService = {
  async fetchData(): Promise<WellbeingData | null> {
    const userId = await getUserId();
    if (!userId) return null;

    const [profileResult, sessionsResult, urgesResult] = await Promise.all([
      supabase
        .from('digital_wellbeing_profiles')
        .select('daily_limit_minutes, reminder_interval_minutes')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('social_media_sessions')
        .select('id, platform, started_at, ended_at, duration_seconds')
        .eq('user_id', userId)
        .order('started_at', { ascending: false }),
      supabase
        .from('social_media_urges')
        .select('id, platform, trigger, outcome, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    if (profileResult.error) throw profileResult.error;
    if (sessionsResult.error) throw sessionsResult.error;
    if (urgesResult.error) throw urgesResult.error;

    return {
      dailyLimitMinutes: profileResult.data?.daily_limit_minutes ?? null,
      reminderIntervalMinutes: profileResult.data?.reminder_interval_minutes ?? null,
      sessions: (sessionsResult.data ?? []).map((row) => ({
        id: row.id,
        platform: row.platform as SocialSession['platform'],
        startedAt: row.started_at,
        endedAt: row.ended_at,
        durationSeconds: row.duration_seconds,
      })),
      urges: (urgesResult.data ?? []).map((row) => ({
        id: row.id,
        platform: row.platform as SocialUrge['platform'],
        trigger: row.trigger as SocialUrge['trigger'],
        outcome: row.outcome as SocialUrge['outcome'],
        createdAt: row.created_at,
      })),
    };
  },

  async upsertProfile(dailyLimitMinutes: number, reminderIntervalMinutes: number) {
    const userId = await getUserId();
    if (!userId) return;

    const { error } = await supabase.from('digital_wellbeing_profiles').upsert({
      user_id: userId,
      daily_limit_minutes: dailyLimitMinutes,
      reminder_interval_minutes: reminderIntervalMinutes,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },

  async upsertSession(session: SocialSession) {
    const userId = await getUserId();
    if (!userId) return;

    const { error } = await supabase.from('social_media_sessions').upsert({
      id: session.id,
      user_id: userId,
      platform: session.platform,
      started_at: session.startedAt,
      ended_at: session.endedAt,
      duration_seconds: session.durationSeconds,
    });
    if (error) throw error;
  },

  async upsertUrge(urge: SocialUrge) {
    const userId = await getUserId();
    if (!userId) return;

    const { error } = await supabase.from('social_media_urges').upsert({
      id: urge.id,
      user_id: userId,
      platform: urge.platform,
      trigger: urge.trigger,
      outcome: urge.outcome,
      created_at: urge.createdAt,
    });
    if (error) throw error;
  },
};
