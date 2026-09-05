'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/use-user-store';
import { SettingsSwitch } from './settings-controls';

export function NotificationPreferences({ scope }: { scope: 'habit' | 'mood' }) {
  const store = useUserStore();
  const [permission, setPermission] = useState<string>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  );
  const enabled = scope === 'habit' ? store.remindersEnabled : store.moodSettings.remindersEnabled;
  const time = scope === 'habit' ? store.dailyReminderTime : store.moodSettings.reminderTime;
  const setEnabled = (value: boolean) =>
    scope === 'habit'
      ? store.setRemindersEnabled(value)
      : store.updateMoodSettings({ remindersEnabled: value });
  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      setPermission(await Notification.requestPermission());
    } catch {
      toast.error('Could not request notification permission.');
    }
  };
  return (
    <>
      <SettingsSwitch
        label={scope === 'habit' ? 'Daily habit reminder' : 'Daily mood check-in'}
        description="Reminders use your device’s local time while the app is open. Browser notification permission is required."
        checked={enabled}
        onCheckedChange={setEnabled}
      />
      {enabled && (
        <Field>
          <FieldLabel htmlFor={`${scope}-reminder-time`}>Reminder time</FieldLabel>
          <Input
            id={`${scope}-reminder-time`}
            type="time"
            value={time}
            onChange={(event) => {
              if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(event.target.value)) return;
              if (scope === 'habit') store.setDailyReminderTime(event.target.value);
              else store.updateMoodSettings({ reminderTime: event.target.value });
            }}
          />
        </Field>
      )}
      <FieldDescription>
        Browser notifications:{' '}
        {permission === 'granted'
          ? 'allowed'
          : permission === 'denied'
            ? 'blocked — enable them in your browser’s site settings'
            : permission === 'unsupported'
              ? 'unavailable on this browser'
              : 'permission needed'}
        .
      </FieldDescription>
      {permission === 'default' && (
        <Button variant="outline" onClick={() => void requestPermission()}>
          Allow notifications
        </Button>
      )}
    </>
  );
}
