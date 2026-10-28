'use client';

import { useRef, useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { MoonStar, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  AppSettingsLink,
  SettingsLoading,
  SettingsSection,
} from '@/components/settings/settings-controls';
import { SettingsContent } from '@/components/shared/settings/settings-content';
import { useUnsavedChanges } from '@/features/settings/use-unsaved-changes';
import { Button } from '@/components/ui/button';
import { useDigitalWellbeingStore } from '@/store/use-digital-wellbeing-store';
import { BedtimeSchedule, toBedtimeFormValue } from '../components/bedtime-schedule';
import {
  WellbeingGoalPreferences,
  WellbeingAlertPreferences,
  WellbeingFocusPreferences,
  WellbeingReportPreferences,
  WellbeingPrivacyPreferences,
} from '../components/wellbeing-settings-preferences';
import { WellbeingSettingsActions } from '../components/wellbeing-settings-actions';
import { useWellbeingData } from '../hooks/use-wellbeing-data';
import { digitalWellbeingService } from '../services/supabase';
import { useFocusSessionStore } from '../store/use-focus-session-store';
import type {
  DigitalWellbeingBedtimeSettingsRow,
  DigitalWellbeingSettingsRow,
} from '../types/database';

function SettingsForm({
  settings,
  bedtime,
  refresh,
  onReset,
}: {
  settings: DigitalWellbeingSettingsRow | null;
  bedtime: DigitalWellbeingBedtimeSettingsRow | null;
  refresh: () => Promise<void>;
  onReset: () => void;
}) {
  const [screenGoal, setScreenGoal] = useState(
    settings?.daily_screen_time_goal_seconds ?? 5 * 3600,
  );
  const [focusGoal, setFocusGoal] = useState(settings?.daily_focus_goal_seconds ?? 2 * 3600);
  const [pickupGoal, setPickupGoal] = useState(settings?.daily_pickup_goal ?? 60);
  const [focusDuration, setFocusDuration] = useState(
    settings?.default_focus_duration_seconds ?? 1500,
  );
  const [screenWarning] = useState(settings?.screen_time_warning_enabled ?? true);
  const [excessiveWarning] = useState(settings?.excessive_usage_warning_enabled ?? true);
  const [appLimitWarning] = useState(settings?.app_limit_warning_enabled ?? true);
  const [focusNotifications] = useState(settings?.focus_notifications_enabled ?? true);
  const [emergencyBreak] = useState(settings?.allow_emergency_focus_break ?? true);
  const [dailySummary] = useState(settings?.daily_summary_enabled ?? false);
  const [weeklyReport] = useState(settings?.weekly_report_enabled ?? true);
  const [monthlyReport] = useState(settings?.monthly_report_enabled ?? false);
  const [retention] = useState(
    settings?.data_retention_days ? String(settings.data_retention_days) : 'forever',
  );
  const [bedtimeValue, setBedtimeValue] = useState(() => toBedtimeFormValue(bedtime));

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const busy = useRef(false);
  const snapshot = JSON.stringify({
    screenGoal,
    focusGoal,
    pickupGoal,
    focusDuration,
    screenWarning,
    excessiveWarning,
    appLimitWarning,
    focusNotifications,
    emergencyBreak,
    dailySummary,
    weeklyReport,
    monthlyReport,
    retention,
    bedtimeValue,
  });
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot);
  const dirty = snapshot !== savedSnapshot;
  useUnsavedChanges(dirty);

  const deleteHistory = async () => {
    if (busy.current) return;
    busy.current = true;
    setDeleting(true);
    try {
      await digitalWellbeingService.deleteHistory();
      useDigitalWellbeingStore.setState({
        sessions: [],
        urges: [],
        activeSession: null,
        activeFocus: null,
      });
      useFocusSessionStore.setState({ activeSession: null });
      await refresh();
      setDeleteOpen(false);
      toast.success('Recorded wellbeing history deleted.');
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Could not delete wellbeing history.');
    } finally {
      busy.current = false;
      setDeleting(false);
    }
  };

  const saveSettings = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      const results = await Promise.allSettled([
        digitalWellbeingService.upsertSettings({
          daily_screen_time_goal_seconds: screenGoal,
          daily_focus_goal_seconds: focusGoal,
          daily_pickup_goal: pickupGoal,
          screen_time_warning_enabled: screenWarning,
          excessive_usage_warning_enabled: excessiveWarning,
          app_limit_warning_enabled: appLimitWarning,
          default_focus_duration_seconds: focusDuration,
          focus_notifications_enabled: focusNotifications,
          allow_emergency_focus_break: emergencyBreak,
          daily_summary_enabled: dailySummary,
          weekly_report_enabled: weeklyReport,
          monthly_report_enabled: monthlyReport,
          data_retention_days: retention === 'forever' ? null : Number(retention),
        }),
        digitalWellbeingService.upsertBedtime({
          bedtime: bedtimeValue.bedtime || null,
          wake_time: bedtimeValue.wakeTime || null,
          active_days: bedtimeValue.activeDays.map(Number),
          bedtime_reminder_enabled: bedtimeValue.reminder,
          reduce_notifications: bedtimeValue.notifications,
          reduce_distracting_apps: bedtimeValue.distractingApps,
          grayscale_enabled: bedtimeValue.grayscale,
        }),
      ]);
      const failure = results.find((result) => result.status === 'rejected');
      if (failure?.status === 'rejected') throw failure.reason;
      setSavedSnapshot(snapshot);
      await refresh();
      toast.success('Wellbeing settings saved.');
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : 'Could not save all wellbeing settings. Please retry.',
      );
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <fieldset disabled={saving || deleting} className="min-w-0">
      <Flex direction="column" gap="5">
        <WellbeingGoalPreferences
          disabled={saving || deleting}
          screenGoal={screenGoal}
          focusGoal={focusGoal}
          pickupGoal={pickupGoal}
          onScreenGoalChange={setScreenGoal}
          onFocusGoalChange={setFocusGoal}
          onPickupGoalChange={setPickupGoal}
        />
        <WellbeingAlertPreferences
          screenWarning={screenWarning}
          excessiveWarning={excessiveWarning}
          appLimitWarning={appLimitWarning}
        />
        <WellbeingFocusPreferences
          disabled={saving || deleting}
          focusDuration={focusDuration}
          onDurationChange={setFocusDuration}
          focusNotifications={focusNotifications}
          emergencyBreak={emergencyBreak}
        />
        <SettingsSection
          icon={MoonStar}
          title="Bedtime"
          description="Plan your sleep schedule. Device controls and bedtime alerts are not available yet."
        >
          <BedtimeSchedule value={bedtimeValue} onChange={setBedtimeValue} />
        </SettingsSection>
        <WellbeingReportPreferences
          dailySummary={dailySummary}
          weeklyReport={weeklyReport}
          monthlyReport={monthlyReport}
        />
        <SettingsSection
          icon={ShieldCheck}
          title="Privacy"
          description="Device permissions and data retention."
          footer={
            <WellbeingSettingsActions
              saving={saving}
              deleting={deleting}
              dirty={dirty}
              deleteOpen={deleteOpen}
              setDeleteOpen={setDeleteOpen}
              saveSettings={saveSettings}
              deleteHistory={deleteHistory}
              onReset={onReset}
            />
          }
        >
          <WellbeingPrivacyPreferences retention={retention} />
        </SettingsSection>
      </Flex>
    </fieldset>
  );
}

export default function DigitalWellbeingSettingsPage() {
  const { settings, bedtime, isLoading, hasLoaded, error, refresh } = useWellbeingData();
  const [resetKey, setResetKey] = useState(0);
  if (isLoading && !hasLoaded) return <SettingsLoading />;
  if (error && !hasLoaded)
    return (
      <SettingsSection
        title="Settings unavailable"
        description="Your preferences could not be loaded. Please try again."
        icon={ShieldCheck}
      >
        <p role="alert">{error}</p>
        <Button variant="outline" onClick={() => void refresh()}>
          Retry loading settings
        </Button>
      </SettingsSection>
    );
  return (
    <SettingsContent>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          Could not refresh settings. {error}
        </p>
      )}
      <SettingsForm
        key={resetKey}
        settings={settings}
        bedtime={bedtime}
        refresh={refresh}
        onReset={() => setResetKey((key) => key + 1)}
      />
      <AppSettingsLink />
    </SettingsContent>
  );
}
