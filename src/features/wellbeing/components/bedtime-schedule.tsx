'use client';

import { Input } from '@/components/ui/input';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { DigitalWellbeingBedtimeSettingsRow } from '../types/database';

const days = [
  { value: '1', label: 'M' },
  { value: '2', label: 'T' },
  { value: '3', label: 'W' },
  { value: '4', label: 'T' },
  { value: '5', label: 'F' },
  { value: '6', label: 'S' },
  { value: '7', label: 'S' },
];

export interface BedtimeFormValue {
  bedtime: string;
  wakeTime: string;
  activeDays: string[];
  reminder: boolean;
  notifications: boolean;
  distractingApps: boolean;
  grayscale: boolean;
}

export const defaultBedtimeValue: BedtimeFormValue = {
  bedtime: '23:00',
  wakeTime: '07:00',
  activeDays: ['1', '2', '3', '4', '5'],
  reminder: true,
  notifications: false,
  distractingApps: false,
  grayscale: false,
};

export function toBedtimeFormValue(
  row: DigitalWellbeingBedtimeSettingsRow | null,
): BedtimeFormValue {
  if (!row) return defaultBedtimeValue;
  return {
    bedtime: row.bedtime?.slice(0, 5) ?? '',
    wakeTime: row.wake_time?.slice(0, 5) ?? '',
    activeDays: row.active_days.map(String),
    reminder: row.bedtime_reminder_enabled,
    notifications: row.reduce_notifications,
    distractingApps: row.reduce_distracting_apps,
    grayscale: row.grayscale_enabled,
  };
}

export function BedtimeSchedule({
  value,
  onChange,
}: {
  value: BedtimeFormValue;
  onChange: (value: BedtimeFormValue) => void;
}) {
  const update = <Key extends keyof BedtimeFormValue>(key: Key, nextValue: BedtimeFormValue[Key]) =>
    onChange({ ...value, [key]: nextValue });

  return (
    <FieldGroup>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="bedtime">Bedtime</FieldLabel>
          <Input
            id="bedtime"
            type="time"
            value={value.bedtime}
            onChange={(event) => update('bedtime', event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="wake-time">Wake-up</FieldLabel>
          <Input
            id="wake-time"
            type="time"
            value={value.wakeTime}
            onChange={(event) => update('wakeTime', event.target.value)}
          />
        </Field>
      </div>
      <Field>
        <FieldLabel>Active days</FieldLabel>
        <ToggleGroup
          type="multiple"
          value={value.activeDays}
          onValueChange={(days) => update('activeDays', days)}
          variant="primary"
          aria-label="Active days"
          className="grid grid-cols-7"
        >
          {days.map((day, index) => (
            <ToggleGroupItem
              key={`${day.value}-${index}`}
              value={day.value}
              aria-label={
                ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][
                  index
                ]
              }
            >
              {day.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>
      {[
        {
          key: 'reminder' as const,
          title: 'Bedtime reminder',
          description: 'Bedtime alerts are not available yet',
        },
        {
          key: 'notifications' as const,
          title: 'Reduce notifications',
          description: 'Not available in the web app',
        },
        {
          key: 'distractingApps' as const,
          title: 'Reduce distracting apps',
          description: 'Not available in the web app',
        },
        {
          key: 'grayscale' as const,
          title: 'Grayscale mode',
          description: 'Not available in the web app',
        },
      ].map((item) => (
        <Field key={item.title} orientation="horizontal" className="rounded-xl border p-3">
          <FieldContent>
            <FieldTitle>{item.title}</FieldTitle>
            <FieldDescription>{item.description}</FieldDescription>
          </FieldContent>
          <Switch
            disabled
            checked={value[item.key]}
            onCheckedChange={(checked) => update(item.key, checked)}
            aria-label={item.title}
          />
        </Field>
      ))}
    </FieldGroup>
  );
}
