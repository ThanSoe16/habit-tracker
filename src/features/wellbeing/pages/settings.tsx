'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import {
  BellRing,
  Brain,
  FileText,
  MoonStar,
  ShieldCheck,
  Target,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AppSettingsLink, SettingsLoading } from '@/components/settings/settings-controls';
import { useUnsavedChanges } from '@/features/settings/use-unsaved-changes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useDigitalWellbeingStore } from '@/store/use-digital-wellbeing-store';
import { BedtimeSchedule, toBedtimeFormValue } from '../components/bedtime-schedule';
import { useWellbeingData } from '../hooks/use-wellbeing-data';
import { digitalWellbeingService } from '../services/supabase';
import { useFocusSessionStore } from '../store/use-focus-session-store';
import { formatDuration } from '../utils/format-duration';
import type {
  DigitalWellbeingBedtimeSettingsRow,
  DigitalWellbeingSettingsRow,
} from '../types/database';

function SettingsSectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <CardHeader className="flex flex-row items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon />
      </span>
      <div className="min-w-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </CardHeader>
  );
}

function SliderSetting({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <Field className="gap-3">
      <div className="flex items-center justify-between gap-3">
        <FieldLabel id={id}>{label}</FieldLabel>
        <Badge variant="secondary">{value}</Badge>
      </div>
      <div role="group" aria-labelledby={id}>
        {children}
      </div>
    </Field>
  );
}

function SettingSwitch({
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Field
      orientation="horizontal"
      className="rounded-2xl border border-transparent bg-muted/50 p-3 transition-colors has-[[data-state=checked]]:border-primary/20 has-[[data-state=checked]]:bg-primary/5"
      data-disabled={disabled || undefined}
    >
      <FieldContent>
        <FieldTitle>{title}</FieldTitle>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
      <Switch
        className="shrink-0"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={title}
      />
    </Field>
  );
}

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
  const [screenWarning, setScreenWarning] = useState(settings?.screen_time_warning_enabled ?? true);
  const [excessiveWarning, setExcessiveWarning] = useState(
    settings?.excessive_usage_warning_enabled ?? true,
  );
  const [appLimitWarning, setAppLimitWarning] = useState(
    settings?.app_limit_warning_enabled ?? true,
  );
  const [focusNotifications, setFocusNotifications] = useState(
    settings?.focus_notifications_enabled ?? true,
  );
  const [emergencyBreak, setEmergencyBreak] = useState(
    settings?.allow_emergency_focus_break ?? true,
  );
  const [dailySummary, setDailySummary] = useState(settings?.daily_summary_enabled ?? false);
  const [weeklyReport, setWeeklyReport] = useState(settings?.weekly_report_enabled ?? true);
  const [monthlyReport, setMonthlyReport] = useState(settings?.monthly_report_enabled ?? false);
  const [retention, setRetention] = useState(
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
    <fieldset disabled={saving || deleting} className="flex min-w-0 flex-col gap-4">
      <Card size="sm" className="rounded-[2rem] border-primary/10 shadow-sm">
        <SettingsSectionHeader
          icon={Target}
          title="Goals"
          description="Targets that shape your score and progress."
        />
        <CardContent>
          <FieldGroup className="gap-4">
            <SliderSetting label="Daily screen-time goal" value={formatDuration(screenGoal)}>
              <Slider
                disabled={saving || deleting}
                aria-label="Daily screen-time goal"
                value={[screenGoal]}
                min={3600}
                max={43200}
                step={1800}
                onValueChange={(value) => setScreenGoal(value[0] ?? 18000)}
              />
            </SliderSetting>
            <SliderSetting label="Daily focus goal" value={formatDuration(focusGoal)}>
              <Slider
                disabled={saving || deleting}
                aria-label="Daily focus goal"
                value={[focusGoal]}
                min={0}
                max={14400}
                step={900}
                onValueChange={(value) => setFocusGoal(value[0] ?? 7200)}
              />
            </SliderSetting>
            <SliderSetting label="Daily pickup goal" value={String(pickupGoal)}>
              <Slider
                disabled={saving || deleting}
                aria-label="Daily pickup goal"
                value={[pickupGoal]}
                min={10}
                max={150}
                step={5}
                onValueChange={(value) => setPickupGoal(value[0] ?? 60)}
              />
            </SliderSetting>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card size="sm" className="rounded-[2rem] border-primary/10 shadow-sm">
        <SettingsSectionHeader
          icon={BellRing}
          title="Usage Alerts"
          description="Usage alerts are not available yet. Existing preferences are preserved."
        />
        <CardContent>
          <FieldGroup className="gap-2">
            <SettingSwitch
              title="Screen-time warning"
              description="Notify near your daily goal"
              checked={screenWarning}
              disabled
              onCheckedChange={setScreenWarning}
            />
            <SettingSwitch
              title="Excessive usage warning"
              description="Notice unusually long sessions"
              checked={excessiveWarning}
              disabled
              onCheckedChange={setExcessiveWarning}
            />
            <SettingSwitch
              title="App limit warning"
              description="Warn before an app limit is reached"
              checked={appLimitWarning}
              disabled
              onCheckedChange={setAppLimitWarning}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card size="sm" className="rounded-[2rem] border-primary/10 shadow-sm">
        <SettingsSectionHeader
          icon={Brain}
          title="Focus"
          description="Choose a default session length. Notification and emergency-break preferences are not available yet."
        />
        <CardContent>
          <FieldGroup className="gap-3">
            <SliderSetting label="Default focus duration" value={formatDuration(focusDuration)}>
              <Slider
                disabled={saving || deleting}
                aria-label="Default focus duration"
                value={[focusDuration]}
                min={300}
                max={7200}
                step={300}
                onValueChange={(value) => setFocusDuration(value[0] ?? 1500)}
              />
            </SliderSetting>
            <SettingSwitch
              title="Focus notifications"
              description="Notify when a session finishes"
              checked={focusNotifications}
              disabled
              onCheckedChange={setFocusNotifications}
            />
            <SettingSwitch
              title="Allow emergency break"
              description="Keep an early-exit option visible"
              checked={emergencyBreak}
              disabled
              onCheckedChange={setEmergencyBreak}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card size="sm" className="rounded-[2rem] border-primary/10 shadow-sm">
        <SettingsSectionHeader
          icon={MoonStar}
          title="Bedtime"
          description="Plan your sleep schedule. Device controls and bedtime alerts are not available yet."
        />
        <CardContent>
          <BedtimeSchedule value={bedtimeValue} onChange={setBedtimeValue} />
        </CardContent>
      </Card>

      <Card size="sm" className="rounded-[2rem] border-primary/10 shadow-sm">
        <SettingsSectionHeader
          icon={FileText}
          title="Reports"
          description="Automatic report delivery is not available yet. View your reports from Insights."
        />
        <CardContent>
          <FieldGroup className="gap-2">
            <SettingSwitch
              title="Daily summary"
              description="A short recap at the end of each day"
              checked={dailySummary}
              disabled
              onCheckedChange={setDailySummary}
            />
            <SettingSwitch
              title="Weekly report"
              description="Trends and goal success every week"
              checked={weeklyReport}
              disabled
              onCheckedChange={setWeeklyReport}
            />
            <SettingSwitch
              title="Monthly report"
              description="Long-term wellbeing patterns"
              checked={monthlyReport}
              disabled
              onCheckedChange={setMonthlyReport}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card size="sm" className="rounded-[2rem] border-primary/10 shadow-sm">
        <SettingsSectionHeader
          icon={ShieldCheck}
          title="Privacy"
          description="Device permissions and data retention."
        />
        <CardContent>
          <FieldGroup className="gap-2">
            <SettingSwitch
              title="Usage data permission"
              description="Requires a future native device integration"
              checked={false}
              onCheckedChange={() => undefined}
              disabled
            />
            <SettingSwitch
              title="Notification access"
              description="Requires a future native device integration"
              checked={false}
              onCheckedChange={() => undefined}
              disabled
            />
            <Field>
              <FieldLabel>Data retention (coming soon)</FieldLabel>
              <FieldDescription>
                Automatic cleanup is not available. History is kept until you delete it.
              </FieldDescription>
              <Select disabled value={retention} onValueChange={setRetention}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Retention period</SelectLabel>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="forever">Keep forever</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <p role="status" className="text-sm text-muted-foreground">
            {saving
              ? 'Saving settings…'
              : dirty
                ? 'You have unsaved changes.'
                : 'Your settings are up to date.'}
          </p>
          <div className="flex w-full gap-2">
            <Button
              disabled={!dirty || saving || deleting}
              className="flex-1"
              onClick={() => void saveSettings()}
            >
              {saving ? 'Saving…' : 'Save settings'}
            </Button>
            <Button variant="outline" disabled={!dirty || saving || deleting} onClick={onReset}>
              Cancel
            </Button>
          </div>
          <AlertDialog
            open={deleteOpen}
            onOpenChange={(open) => {
              if (!deleting) setDeleteOpen(open);
            }}
          >
            <AlertDialogTrigger asChild>
              <Button
                disabled={dirty || saving || deleting}
                variant="destructive"
                className="w-full"
              >
                <Trash2 data-icon="inline-start" /> Delete wellbeing history
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete wellbeing history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes recorded usage, focus sessions, insights, social
                  sessions, and urges. Your goals and settings remain.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleting}
                  variant="destructive"
                  onClick={(event) => {
                    event.preventDefault();
                    void deleteHistory();
                  }}
                >
                  {deleting ? 'Deleting…' : 'Delete history'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </fieldset>
  );
}

export default function DigitalWellbeingSettingsPage() {
  const { settings, bedtime, isLoading, hasLoaded, error, refresh } = useWellbeingData();
  const [resetKey, setResetKey] = useState(0);
  if (isLoading && !hasLoaded) return <SettingsLoading />;
  if (error && !hasLoaded)
    return (
      <Card>
        <CardContent>
          <p role="alert">{error}</p>
          <Button variant="outline" onClick={() => void refresh()}>
            Retry loading settings
          </Button>
        </CardContent>
      </Card>
    );
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 pb-8">
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
    </div>
  );
}
