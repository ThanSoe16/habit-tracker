'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useDigitalWellbeingStore } from '@/store/use-digital-wellbeing-store';
import { BedtimeSchedule, toBedtimeFormValue } from '../components/bedtime-schedule';
import { useWellbeingData } from '../hooks/use-wellbeing-data';
import { digitalWellbeingService } from '../services/supabase';
import { useFocusSessionStore } from '../store/use-focus-session-store';
import { formatDuration } from '../utils/format-duration';
import type { DigitalWellbeingBedtimeSettingsRow, DigitalWellbeingSettingsRow } from '../types/database';

function SettingSwitch({ title, description, checked, onCheckedChange, disabled = false }: { title: string; description: string; checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <Field orientation="horizontal" className="rounded-xl border p-3" data-disabled={disabled || undefined}>
      <FieldContent><FieldTitle>{title}</FieldTitle><FieldDescription>{description}</FieldDescription></FieldContent>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-label={title} />
    </Field>
  );
}

function SettingsForm({ settings, bedtime, refresh }: { settings: DigitalWellbeingSettingsRow | null; bedtime: DigitalWellbeingBedtimeSettingsRow | null; refresh: () => Promise<void> }) {
  const [screenGoal, setScreenGoal] = useState(settings?.daily_screen_time_goal_seconds ?? 5 * 3600);
  const [focusGoal, setFocusGoal] = useState(settings?.daily_focus_goal_seconds ?? 2 * 3600);
  const [pickupGoal, setPickupGoal] = useState(settings?.daily_pickup_goal ?? 60);
  const [focusDuration, setFocusDuration] = useState(settings?.default_focus_duration_seconds ?? 1500);
  const [screenWarning, setScreenWarning] = useState(settings?.screen_time_warning_enabled ?? true);
  const [excessiveWarning, setExcessiveWarning] = useState(settings?.excessive_usage_warning_enabled ?? true);
  const [appLimitWarning, setAppLimitWarning] = useState(settings?.app_limit_warning_enabled ?? true);
  const [focusNotifications, setFocusNotifications] = useState(settings?.focus_notifications_enabled ?? true);
  const [emergencyBreak, setEmergencyBreak] = useState(settings?.allow_emergency_focus_break ?? true);
  const [dailySummary, setDailySummary] = useState(settings?.daily_summary_enabled ?? false);
  const [weeklyReport, setWeeklyReport] = useState(settings?.weekly_report_enabled ?? true);
  const [monthlyReport, setMonthlyReport] = useState(settings?.monthly_report_enabled ?? false);
  const [retention, setRetention] = useState(settings?.data_retention_days ? String(settings.data_retention_days) : 'forever');
  const [bedtimeValue, setBedtimeValue] = useState(() => toBedtimeFormValue(bedtime));

  const deleteHistory = async () => {
    try {
      await digitalWellbeingService.deleteHistory();
      useDigitalWellbeingStore.setState({ sessions: [], urges: [], activeSession: null, activeFocus: null });
      useFocusSessionStore.setState({ activeSession: null });
      await refresh();
      toast.success('Recorded wellbeing history deleted.');
    } catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Could not delete wellbeing history.'); }
  };

  const saveSettings = async () => {
    try {
      await Promise.all([
        digitalWellbeingService.upsertSettings({ daily_screen_time_goal_seconds: screenGoal, daily_focus_goal_seconds: focusGoal, daily_pickup_goal: pickupGoal, screen_time_warning_enabled: screenWarning, excessive_usage_warning_enabled: excessiveWarning, app_limit_warning_enabled: appLimitWarning, default_focus_duration_seconds: focusDuration, focus_notifications_enabled: focusNotifications, allow_emergency_focus_break: emergencyBreak, daily_summary_enabled: dailySummary, weekly_report_enabled: weeklyReport, monthly_report_enabled: monthlyReport, data_retention_days: retention === 'forever' ? null : Number(retention) }),
        digitalWellbeingService.upsertBedtime({ bedtime: bedtimeValue.bedtime || null, wake_time: bedtimeValue.wakeTime || null, active_days: bedtimeValue.activeDays.map(Number), bedtime_reminder_enabled: bedtimeValue.reminder, reduce_notifications: bedtimeValue.notifications, reduce_distracting_apps: bedtimeValue.distractingApps, grayscale_enabled: bedtimeValue.grayscale }),
      ]);
      await refresh();
      toast.success('Wellbeing settings saved.');
    } catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Could not save wellbeing settings.'); }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader><CardTitle>Goals</CardTitle><CardDescription>Targets that shape your score and progress.</CardDescription></CardHeader>
        <CardContent><FieldGroup>
          <Field><FieldLabel>Daily screen-time goal: {formatDuration(screenGoal)}</FieldLabel><Slider value={[screenGoal]} min={3600} max={43200} step={1800} onValueChange={(value) => setScreenGoal(value[0] ?? 18000)} /></Field>
          <Field><FieldLabel>Daily focus goal: {formatDuration(focusGoal)}</FieldLabel><Slider value={[focusGoal]} min={0} max={14400} step={900} onValueChange={(value) => setFocusGoal(value[0] ?? 7200)} /></Field>
          <Field><FieldLabel>Daily pickup goal: {pickupGoal}</FieldLabel><Slider value={[pickupGoal]} min={10} max={150} step={5} onValueChange={(value) => setPickupGoal(value[0] ?? 60)} /></Field>
        </FieldGroup></CardContent>
      </Card>

      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader><CardTitle>Usage Alerts</CardTitle><CardDescription>Gentle interruptions when usage becomes excessive.</CardDescription></CardHeader>
        <CardContent><FieldGroup><SettingSwitch title="Screen-time warning" description="Notify near your daily goal" checked={screenWarning} onCheckedChange={setScreenWarning} /><SettingSwitch title="Excessive usage warning" description="Notice unusually long sessions" checked={excessiveWarning} onCheckedChange={setExcessiveWarning} /><SettingSwitch title="App limit warning" description="Warn before an app limit is reached" checked={appLimitWarning} onCheckedChange={setAppLimitWarning} /></FieldGroup></CardContent>
      </Card>

      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader><CardTitle>Focus</CardTitle><CardDescription>Defaults for new focus sessions.</CardDescription></CardHeader>
        <CardContent><FieldGroup>
          <Field><FieldLabel>Default focus duration: {formatDuration(focusDuration)}</FieldLabel><Slider value={[focusDuration]} min={300} max={7200} step={300} onValueChange={(value) => setFocusDuration(value[0] ?? 1500)} /></Field>
          <SettingSwitch title="Focus notifications" description="Notify when a session finishes" checked={focusNotifications} onCheckedChange={setFocusNotifications} />
          <SettingSwitch title="Allow emergency break" description="Keep an early-exit option visible" checked={emergencyBreak} onCheckedChange={setEmergencyBreak} />
        </FieldGroup></CardContent>
      </Card>

      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader><CardTitle>Bedtime</CardTitle><CardDescription>Quiet hours and native feature placeholders.</CardDescription></CardHeader>
        <CardContent><BedtimeSchedule value={bedtimeValue} onChange={setBedtimeValue} /></CardContent>
      </Card>

      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader><CardTitle>Reports</CardTitle><CardDescription>Choose the summaries you want to receive.</CardDescription></CardHeader>
        <CardContent><FieldGroup><SettingSwitch title="Daily summary" description="A short recap at the end of each day" checked={dailySummary} onCheckedChange={setDailySummary} /><SettingSwitch title="Weekly report" description="Trends and goal success every week" checked={weeklyReport} onCheckedChange={setWeeklyReport} /><SettingSwitch title="Monthly report" description="Long-term wellbeing patterns" checked={monthlyReport} onCheckedChange={setMonthlyReport} /></FieldGroup></CardContent>
      </Card>

      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader><CardTitle>Privacy</CardTitle><CardDescription>Device permissions and data retention.</CardDescription></CardHeader>
        <CardContent><FieldGroup>
          <SettingSwitch title="Usage data permission" description="Requires a future native device integration" checked={false} onCheckedChange={() => undefined} disabled />
          <SettingSwitch title="Notification access" description="Requires a future native device integration" checked={false} onCheckedChange={() => undefined} disabled />
          <Field><FieldLabel>Data retention</FieldLabel><Select value={retention} onValueChange={setRetention}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectLabel>Retention period</SelectLabel><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem><SelectItem value="365">1 year</SelectItem><SelectItem value="forever">Keep forever</SelectItem></SelectGroup></SelectContent></Select></Field>
        </FieldGroup></CardContent>
        <CardFooter className="flex-col gap-3">
          <Button className="w-full" onClick={() => void saveSettings()}>Save settings</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive" className="w-full"><Trash2 data-icon="inline-start" /> Delete wellbeing history</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete wellbeing history?</AlertDialogTitle><AlertDialogDescription>This permanently removes recorded usage, focus sessions, insights, social sessions, and urges. Your goals and settings remain.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => void deleteHistory()}>Delete history</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function DigitalWellbeingSettingsPage() {
  const { settings, bedtime, isLoading, error, refresh } = useWellbeingData();
  if (isLoading) return <div className="min-h-[60vh]" />;
  if (error) return <Card><CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent></Card>;
  return <SettingsForm key={`${settings?.updated_at ?? 'new'}-${bedtime?.updated_at ?? 'new'}`} settings={settings} bedtime={bedtime} refresh={refresh} />;
}
