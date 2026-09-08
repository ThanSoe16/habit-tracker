import { z } from 'zod';
import {
  appLimitSchema,
  wellbeingSettingsSchema,
  bedtimeSettingsSchema,
  focusUpdateSchema,
} from '../types/write-schemas';
import { identityRevision, isIdentityRevisionCurrent } from '@/lib/supabase/identity-scope';
import {
  readCompleteList,
  DataRequestError,
  requireResult,
  textIdSchema,
} from '@/lib/supabase/request';
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
  const revision = identityRevision();
  const { data, error } = await supabase.auth.getSession();
  if (error || !isIdentityRevisionCurrent(revision))
    throw new DataRequestError('Your session changed. Please reload.');
  return data.session?.user.id ?? null;
}

async function requireUserId() {
  const userId = await getUserId();
  if (!userId) throw new Error('You must be signed in to use Digital Wellbeing.');
  return userId;
}

function throwIfError(error: { code?: string } | null) {
  if (error) throw new DataRequestError('Could not sync wellbeing data. Please try again.', error);
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
      readCompleteList(
        supabase
          .from('digital_wellbeing_daily_usage')
          .select(
            'id, user_id, usage_date, screen_time_seconds, focus_time_seconds, pickup_count, notification_count, late_night_usage_seconds, app_limit_violations, wellbeing_score, created_at, updated_at',
            { count: 'exact' },
          )
          .eq('user_id', userId)
          .order('usage_date')
          .order('id'),
      ),
      readCompleteList(
        supabase
          .from('digital_wellbeing_app_usage')
          .select(
            'id, user_id, usage_date, app_identifier, app_name, app_icon_url, category, usage_seconds, open_count, notification_count, created_at, updated_at',
            { count: 'exact' },
          )
          .eq('user_id', userId)
          .order('usage_date')
          .order('id'),
      ),
      readCompleteList(
        supabase
          .from('digital_wellbeing_app_limits')
          .select(
            'id, user_id, app_identifier, app_name, daily_limit_seconds, warning_before_seconds, is_enabled, created_at, updated_at',
            { count: 'exact' },
          )
          .eq('user_id', userId)
          .order('created_at')
          .order('id'),
      ),
      readCompleteList(
        supabase
          .from('digital_wellbeing_focus_sessions')
          .select(
            'id, user_id, started_at, ended_at, planned_duration_seconds, completed_duration_seconds, status, pause_count, created_at, updated_at',
            { count: 'exact' },
          )
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .order('id'),
      ),
      readCompleteList(
        supabase
          .from('digital_wellbeing_focus_session_apps')
          .select('id, focus_session_id, app_identifier, app_name, created_at', { count: 'exact' })
          .order('id'),
      ),
      readCompleteList(
        supabase
          .from('digital_wellbeing_challenges')
          .select(
            'id, title, description, challenge_type, target_value, target_unit, duration_days, is_active, created_at, updated_at',
            { count: 'exact' },
          )
          .eq('is_active', true)
          .order('created_at')
          .order('id'),
      ),
      readCompleteList(
        supabase
          .from('digital_wellbeing_user_challenges')
          .select(
            'id, user_id, challenge_id, started_at, ended_at, current_value, target_value, status, completed_at, created_at, updated_at',
            { count: 'exact' },
          )
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .order('id'),
      ),
      supabase
        .from('digital_wellbeing_settings')
        .select(
          'id, user_id, daily_screen_time_goal_seconds, daily_focus_goal_seconds, daily_pickup_goal, screen_time_warning_enabled, excessive_usage_warning_enabled, app_limit_warning_enabled, default_focus_duration_seconds, focus_notifications_enabled, allow_emergency_focus_break, daily_summary_enabled, weekly_report_enabled, monthly_report_enabled, data_retention_days, created_at, updated_at',
        )
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('digital_wellbeing_bedtime_settings')
        .select(
          'id, user_id, bedtime, wake_time, active_days, bedtime_reminder_enabled, reduce_notifications, reduce_distracting_apps, grayscale_enabled, created_at, updated_at',
        )
        .eq('user_id', userId)
        .maybeSingle(),
      readCompleteList(
        supabase
          .from('digital_wellbeing_insights')
          .select(
            'id, user_id, insight_date, insight_type, title, message, value, previous_value, change_percent, severity, is_read, created_at',
            { count: 'exact' },
          )
          .eq('user_id', userId)
          .order('insight_date', { ascending: false })
          .order('id'),
      ),
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

  async upsertAppLimit(
    input: Pick<
      DigitalWellbeingAppLimitRow,
      | 'app_identifier'
      | 'app_name'
      | 'daily_limit_seconds'
      | 'warning_before_seconds'
      | 'is_enabled'
    >,
  ) {
    const userId = await requireUserId();
    const values = appLimitSchema.parse(input);
    return requireResult(
      await supabase
        .from('digital_wellbeing_app_limits')
        .upsert({ ...values, user_id: userId }, { onConflict: 'user_id,app_identifier' })
        .select(
          'id, app_identifier, app_name, daily_limit_seconds, warning_before_seconds, is_enabled',
        )
        .single(),
    );
  },

  async deleteAppLimit(id: string) {
    const userId = await requireUserId();
    requireResult(
      await supabase
        .from('digital_wellbeing_app_limits')
        .delete()
        .eq('id', textIdSchema.parse(id))
        .eq('user_id', userId)
        .select('id')
        .single(),
      'Could not delete the app limit. Please try again.',
    );
  },

  async startFocusSession(
    id: string,
    startedAt: string,
    plannedDurationSeconds: number,
    apps: string[],
  ) {
    const userId = await requireUserId();
    const sessionResult = await supabase.from('digital_wellbeing_focus_sessions').insert({
      id,
      user_id: userId,
      started_at: startedAt,
      planned_duration_seconds: plannedDurationSeconds,
      completed_duration_seconds: 0,
      status: 'ACTIVE',
      pause_count: 0,
    });
    throwIfError(sessionResult.error);
    if (apps.length) {
      const { error } = await supabase.from('digital_wellbeing_focus_session_apps').insert(
        apps.map((app) => ({
          focus_session_id: id,
          app_identifier: app.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'),
          app_name: app,
        })),
      );
      throwIfError(error);
    }
  },

  async updateFocusSession(
    id: string,
    input: {
      status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
      plannedDurationSeconds: number;
      completedDurationSeconds: number;
      pauseCount: number;
      endedAt?: string | null;
    },
  ) {
    id = z.string().uuid().parse(id);
    input = focusUpdateSchema.parse(input);
    const userId = await requireUserId();
    const result = await supabase
      .from('digital_wellbeing_focus_sessions')
      .update({
        status: input.status,
        planned_duration_seconds: input.plannedDurationSeconds,
        completed_duration_seconds: input.completedDurationSeconds,
        pause_count: input.pauseCount,
        ended_at: input.endedAt,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .single();
    return requireResult(result);
  },

  async startChallenge(challenge: DigitalWellbeingChallengeRow) {
    const userId = await requireUserId();
    const existing = await supabase
      .from('digital_wellbeing_user_challenges')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challenge.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();
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
      ? supabase
          .from('digital_wellbeing_user_challenges')
          .update(payload)
          .eq('id', existing.data.id)
          .eq('user_id', userId)
      : supabase.from('digital_wellbeing_user_challenges').insert(payload);
    const { error } = await query;
    throwIfError(error);
  },

  async cancelChallenge(id: string) {
    id = z.string().uuid().parse(id);
    const userId = await requireUserId();
    const result = await supabase
      .from('digital_wellbeing_user_challenges')
      .update({ status: 'CANCELLED', ended_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .single();
    return requireResult(result);
  },

  async upsertSettings(input: Partial<DigitalWellbeingSettingsRow>) {
    const userId = await requireUserId();
    const values = wellbeingSettingsSchema.parse(input);
    const result = await supabase
      .from('digital_wellbeing_settings')
      .upsert({ ...values, user_id: userId }, { onConflict: 'user_id' })
      .select(
        'id, daily_screen_time_goal_seconds, daily_focus_goal_seconds, daily_pickup_goal, screen_time_warning_enabled, excessive_usage_warning_enabled, app_limit_warning_enabled, default_focus_duration_seconds, focus_notifications_enabled, allow_emergency_focus_break, daily_summary_enabled, weekly_report_enabled, monthly_report_enabled, data_retention_days',
      )
      .single();
    return requireResult(result);
  },

  async upsertBedtime(input: Partial<DigitalWellbeingBedtimeSettingsRow>) {
    const userId = await requireUserId();
    const values = bedtimeSettingsSchema.parse(input);
    const result = await supabase
      .from('digital_wellbeing_bedtime_settings')
      .upsert({ ...values, user_id: userId }, { onConflict: 'user_id' })
      .select(
        'id, bedtime, wake_time, active_days, bedtime_reminder_enabled, reduce_notifications, reduce_distracting_apps, grayscale_enabled',
      )
      .single();
    return requireResult(result);
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
      readCompleteList(
        supabase
          .from('social_media_sessions')
          .select('id, platform, started_at, ended_at, duration_seconds', { count: 'exact' })
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .order('id'),
      ),
      readCompleteList(
        supabase
          .from('social_media_urges')
          .select('id, platform, trigger, outcome, created_at', { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .order('id'),
      ),
    ]);

    throwIfError(profileResult.error);
    throwIfError(sessionsResult.error);
    throwIfError(urgesResult.error);

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
    const userId = await requireUserId();

    const { error } = await supabase.from('digital_wellbeing_profiles').upsert({
      user_id: userId,
      daily_limit_minutes: dailyLimitMinutes,
      reminder_interval_minutes: reminderIntervalMinutes,
      updated_at: new Date().toISOString(),
    });
    throwIfError(error);
  },

  async upsertSession(session: SocialSession) {
    const userId = await requireUserId();

    const { error } = await supabase.from('social_media_sessions').upsert({
      id: session.id,
      user_id: userId,
      platform: session.platform,
      started_at: session.startedAt,
      ended_at: session.endedAt,
      duration_seconds: session.durationSeconds,
    });
    throwIfError(error);
  },

  async upsertUrge(urge: SocialUrge) {
    const userId = await requireUserId();

    const { error } = await supabase.from('social_media_urges').upsert({
      id: urge.id,
      user_id: userId,
      platform: urge.platform,
      trigger: urge.trigger,
      outcome: urge.outcome,
      created_at: urge.createdAt,
    });
    throwIfError(error);
  },
};
