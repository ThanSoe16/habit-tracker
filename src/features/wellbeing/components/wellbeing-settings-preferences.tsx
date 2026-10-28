'use client';

import { useId, type ReactNode } from 'react';
import { BellRing, Brain, FileText, Target } from 'lucide-react';
import { Flex } from '@radix-ui/themes';
import { Badge } from '@/components/ui/badge';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
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
import { SettingsSection, SettingsSwitch } from '@/components/settings/settings-controls';
import { formatDuration } from '../utils/format-duration';

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
      <Flex align="center" justify="between" gap="3">
        <FieldLabel id={id}>{label}</FieldLabel>
        <Badge variant="secondary">{value}</Badge>
      </Flex>
      <div role="group" aria-labelledby={id}>
        {children}
      </div>
    </Field>
  );
}

export function WellbeingGoalPreferences({
  screenGoal,
  focusGoal,
  pickupGoal,
  onScreenGoalChange,
  onFocusGoalChange,
  onPickupGoalChange,
  disabled,
}: {
  screenGoal: number;
  focusGoal: number;
  pickupGoal: number;
  onScreenGoalChange: (value: number) => void;
  onFocusGoalChange: (value: number) => void;
  onPickupGoalChange: (value: number) => void;
  disabled: boolean;
}) {
  return (
    <SettingsSection
      icon={Target}
      title="Goals"
      description="Targets that shape your score and progress."
    >
      <FieldGroup className="gap-4">
        <SliderSetting label="Daily screen-time goal" value={formatDuration(screenGoal)}>
          <Slider
            disabled={disabled}
            aria-label="Daily screen-time goal"
            value={[screenGoal]}
            min={3600}
            max={43200}
            step={1800}
            onValueChange={(value) => onScreenGoalChange(value[0] ?? 18000)}
          />
        </SliderSetting>
        <SliderSetting label="Daily focus goal" value={formatDuration(focusGoal)}>
          <Slider
            disabled={disabled}
            aria-label="Daily focus goal"
            value={[focusGoal]}
            min={0}
            max={14400}
            step={900}
            onValueChange={(value) => onFocusGoalChange(value[0] ?? 7200)}
          />
        </SliderSetting>
        <SliderSetting label="Daily pickup goal" value={String(pickupGoal)}>
          <Slider
            disabled={disabled}
            aria-label="Daily pickup goal"
            value={[pickupGoal]}
            min={10}
            max={150}
            step={5}
            onValueChange={(value) => onPickupGoalChange(value[0] ?? 60)}
          />
        </SliderSetting>
      </FieldGroup>
    </SettingsSection>
  );
}

export function WellbeingAlertPreferences({
  screenWarning,
  excessiveWarning,
  appLimitWarning,
}: {
  screenWarning: boolean;
  excessiveWarning: boolean;
  appLimitWarning: boolean;
}) {
  return (
    <SettingsSection
      icon={BellRing}
      title="Usage alerts"
      description="Usage alerts are not available yet. Existing preferences are preserved."
    >
      <FieldGroup className="gap-2">
        <SettingsSwitch
          label="Screen-time warning"
          description="Notify near your daily goal"
          checked={screenWarning}
          disabled
          onCheckedChange={() => undefined}
        />
        <SettingsSwitch
          label="Excessive usage warning"
          description="Notice unusually long sessions"
          checked={excessiveWarning}
          disabled
          onCheckedChange={() => undefined}
        />
        <SettingsSwitch
          label="App limit warning"
          description="Warn before an app limit is reached"
          checked={appLimitWarning}
          disabled
          onCheckedChange={() => undefined}
        />
      </FieldGroup>
    </SettingsSection>
  );
}

export function WellbeingFocusPreferences({
  focusDuration,
  focusNotifications,
  emergencyBreak,
  onDurationChange,
  disabled,
}: {
  focusDuration: number;
  focusNotifications: boolean;
  emergencyBreak: boolean;
  onDurationChange: (value: number) => void;
  disabled: boolean;
}) {
  return (
    <SettingsSection
      icon={Brain}
      title="Focus"
      description="Choose a default session length. Notification and emergency-break preferences are not available yet."
    >
      <FieldGroup className="gap-3">
        <SliderSetting label="Default focus duration" value={formatDuration(focusDuration)}>
          <Slider
            disabled={disabled}
            aria-label="Default focus duration"
            value={[focusDuration]}
            min={300}
            max={7200}
            step={300}
            onValueChange={(value) => onDurationChange(value[0] ?? 1500)}
          />
        </SliderSetting>
        <SettingsSwitch
          label="Focus notifications"
          description="Notify when a session finishes"
          checked={focusNotifications}
          disabled
          onCheckedChange={() => undefined}
        />
        <SettingsSwitch
          label="Allow emergency break"
          description="Keep an early-exit option visible"
          checked={emergencyBreak}
          disabled
          onCheckedChange={() => undefined}
        />
      </FieldGroup>
    </SettingsSection>
  );
}

export function WellbeingReportPreferences({
  dailySummary,
  weeklyReport,
  monthlyReport,
}: {
  dailySummary: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
}) {
  return (
    <SettingsSection
      icon={FileText}
      title="Reports"
      description="Automatic report delivery is not available yet. View your reports from Insights."
    >
      <FieldGroup className="gap-2">
        <SettingsSwitch
          label="Daily summary"
          description="A short recap at the end of each day"
          checked={dailySummary}
          disabled
          onCheckedChange={() => undefined}
        />
        <SettingsSwitch
          label="Weekly report"
          description="Trends and goal success every week"
          checked={weeklyReport}
          disabled
          onCheckedChange={() => undefined}
        />
        <SettingsSwitch
          label="Monthly report"
          description="Long-term wellbeing patterns"
          checked={monthlyReport}
          disabled
          onCheckedChange={() => undefined}
        />
      </FieldGroup>
    </SettingsSection>
  );
}

export function WellbeingPrivacyPreferences({ retention }: { retention: string }) {
  return (
    <FieldGroup className="gap-2">
      <SettingsSwitch
        label="Usage data permission"
        description="Requires a future native device integration"
        checked={false}
        onCheckedChange={() => undefined}
        disabled
      />
      <SettingsSwitch
        label="Notification access"
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
        <Select disabled value={retention}>
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
  );
}
