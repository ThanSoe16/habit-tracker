'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { digitalWellbeingService, type WellbeingDashboardRows } from '../services/supabase';
import type { AppCategory, AppLimit, AppUsage, DailyUsage, FocusHistoryItem, WellbeingChallenge, WellbeingInsight } from '../types';
import type { DigitalWellbeingAppUsageRow, DigitalWellbeingUserChallengeRow } from '../types/database';

const categoryNames: Record<string, AppCategory> = {
  SOCIAL: 'Social',
  ENTERTAINMENT: 'Entertainment',
  PRODUCTIVITY: 'Productivity',
  GAMES: 'Games',
  EDUCATION: 'Education',
};

const emptyRows: WellbeingDashboardRows = {
  dailyUsage: [], appUsage: [], appLimits: [], focusSessions: [], focusSessionApps: [],
  challenges: [], userChallenges: [], settings: null, bedtime: null, insights: [],
};

function aggregateAppUsage(rows: DigitalWellbeingAppUsageRow[]) {
  const appsById = new Map<string, AppUsage>();
  for (const row of rows) {
    const existing = appsById.get(row.app_identifier);
    appsById.set(row.app_identifier, {
      id: row.app_identifier,
      appIdentifier: row.app_identifier,
      appName: row.app_name,
      icon: row.app_name.slice(0, 1).toUpperCase(),
      iconUrl: row.app_icon_url,
      category: categoryNames[row.category ?? ''] ?? 'Other',
      durationSeconds: (existing?.durationSeconds ?? 0) + row.usage_seconds,
      percentage: 0,
      openCount: (existing?.openCount ?? 0) + row.open_count,
      notifications: (existing?.notifications ?? 0) + row.notification_count,
    });
  }
  const totalSeconds = [...appsById.values()].reduce((sum, app) => sum + app.durationSeconds, 0);
  return [...appsById.values()]
    .map((app) => ({ ...app, percentage: totalSeconds ? Math.round(app.durationSeconds / totalSeconds * 100) : 0 }))
    .sort((a, b) => b.durationSeconds - a.durationSeconds);
}

export function useWellbeingData(days = 30) {
  const [rows, setRows] = useState<WellbeingDashboardRows>(emptyRows);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setRows(await digitalWellbeingService.fetchDashboard());
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load wellbeing data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const handleChange = () => { void refresh(); };
    window.addEventListener('digital-wellbeing-change', handleChange);
    return () => window.removeEventListener('digital-wellbeing-change', handleChange);
  }, [refresh]);

  const data = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Math.max(0, days - 1));
    const cutoffDate = cutoff.toLocaleDateString('en-CA');
    const periodDailyRows = rows.dailyUsage.filter((row) => row.usage_date >= cutoffDate);
    const periodAppRows = rows.appUsage.filter((row) => row.usage_date >= cutoffDate);
    const dailyUsage: DailyUsage[] = periodDailyRows.map((row) => ({
      date: row.usage_date,
      screenTimeSeconds: row.screen_time_seconds,
      focusTimeSeconds: row.focus_time_seconds,
      pickups: row.pickup_count,
      notifications: row.notification_count,
      lateNightUsageSeconds: row.late_night_usage_seconds,
      appLimitViolations: row.app_limit_violations,
    }));

    const today = new Date().toLocaleDateString('en-CA');
    const appUsage = aggregateAppUsage(periodAppRows);
    const todayAppUsage = aggregateAppUsage(rows.appUsage.filter((row) => row.usage_date === today));
    const todayUsage = new Map(rows.appUsage.filter((row) => row.usage_date === today).map((row) => [row.app_identifier, row.usage_seconds]));
    const appLimits: AppLimit[] = rows.appLimits.map((row) => ({
      id: row.id,
      appIdentifier: row.app_identifier,
      appName: row.app_name,
      icon: row.app_name.slice(0, 1).toUpperCase(),
      dailyLimitSeconds: row.daily_limit_seconds,
      usedTodaySeconds: todayUsage.get(row.app_identifier) ?? 0,
      warningBeforeSeconds: row.warning_before_seconds,
      enabled: row.is_enabled,
    }));

    const appsBySession = new Map<string, string[]>();
    rows.focusSessionApps.forEach((row) => appsBySession.set(row.focus_session_id, [...(appsBySession.get(row.focus_session_id) ?? []), row.app_name]));
    const focusHistory: FocusHistoryItem[] = rows.focusSessions.map((row) => ({
      id: row.id,
      startedAt: row.started_at,
      durationSeconds: row.completed_duration_seconds,
      status: row.status,
      apps: appsBySession.get(row.id) ?? [],
    }));

    const latestUserChallenge = new Map<string, DigitalWellbeingUserChallengeRow>();
    rows.userChallenges.forEach((row) => {
      if (!latestUserChallenge.has(row.challenge_id)) latestUserChallenge.set(row.challenge_id, row);
    });
    const challenges: WellbeingChallenge[] = rows.challenges.map((challenge) => {
      const userChallenge = latestUserChallenge.get(challenge.id);
      const startedAt = userChallenge?.started_at ?? '';
      const endDate = userChallenge?.ended_at ?? (startedAt && challenge.duration_days
        ? new Date(new Date(startedAt).getTime() + challenge.duration_days * 86_400_000).toISOString()
        : '');
      return {
        id: challenge.id,
        enrollmentId: userChallenge?.id,
        title: challenge.title,
        description: challenge.description ?? '',
        type: challenge.challenge_type,
        target: userChallenge?.target_value ?? challenge.target_value ?? 0,
        progress: userChallenge?.current_value ?? 0,
        unit: (challenge.target_unit ?? '').toLowerCase(),
        startDate: startedAt,
        endDate,
        status: userChallenge?.status ?? 'AVAILABLE',
      };
    });

    const insights: WellbeingInsight[] = rows.insights.map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      severity: row.severity.toLowerCase() as WellbeingInsight['severity'],
      period: row.insight_type === 'LATE_NIGHT_USAGE' ? 'monthly' : 'weekly',
    }));

    return { dailyUsage, appUsage, todayAppUsage, appLimits, focusHistory, challenges, insights, settings: rows.settings, bedtime: rows.bedtime };
  }, [days, rows]);

  return { ...data, rows, isLoading, error, refresh };
}
