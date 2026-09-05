'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useUserStore } from '@/store/use-user-store';
import { Button } from '@/components/ui/button';
import { FieldDescription } from '@/components/ui/field';
import {
  SettingsLoading,
  SettingsSaveStatus,
  SettingsSection,
  SettingsSwitch,
} from '@/components/settings/settings-controls';
import { NotificationPreferences } from '@/components/settings/notification-preferences';
import { RingtoneDrawerModal } from './ringtone-drawer-modal';
import { AppearanceDrawerModal } from './appearance-drawer-modal';
import { version } from '../../../../../package.json';

const modules = [
  ['Habits', '/generals/settings'],
  ['Workouts', '/workout-generals/settings'],
  ['Mood', '/mood-generals/settings'],
  ['Budget', '/budget-generals/settings'],
  ['Media', '/store-generals/settings'],
  ['Digital wellbeing', '/digital-wellbeing/settings'],
];

export function SettingsList() {
  const { ringtone, vibrationEnabled, setVibrationEnabled, theme, appearanceSettings, isLoaded } =
    useUserStore();
  const [ringtoneOpen, setRingtoneOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <SettingsSaveStatus />
      {isLoaded ? (
        <>
          <SettingsSection
            title="Appearance"
            description="Personalize every module with one shared theme."
          >
            <Button
              variant="outline"
              onClick={() => setAppearanceOpen(true)}
              className="justify-between"
            >
              {theme === 'system' ? 'Device setting' : theme === 'dark' ? 'Dark' : 'Light'} ·{' '}
              {appearanceSettings.accentColor}
              <ChevronRight data-icon="inline-end" />
            </Button>
          </SettingsSection>
          <SettingsSection title="Sound & vibration">
            <Button
              variant="outline"
              onClick={() => setRingtoneOpen(true)}
              className="justify-between"
            >
              Alarm ringtone · {ringtone}
              <ChevronRight data-icon="inline-end" />
            </Button>
            <SettingsSwitch
              label="Vibration"
              description="Used for alerts on devices that support vibration."
              checked={vibrationEnabled}
              onCheckedChange={(enabled) => {
                setVibrationEnabled(enabled);
                if (enabled && typeof navigator.vibrate === 'function') navigator.vibrate(150);
              }}
            />
          </SettingsSection>
          <SettingsSection title="Habit notifications">
            <NotificationPreferences scope="habit" />
          </SettingsSection>
          <SettingsSection title="Mood notifications">
            <NotificationPreferences scope="mood" />
          </SettingsSection>
        </>
      ) : (
        <SettingsLoading />
      )}
      <SettingsSection
        title="Module settings"
        description="Configure how each part of the app works."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {modules.map(([label, href]) => (
            <Button key={href} variant="outline" asChild className="justify-between">
              <Link href={href}>
                {label}
                <ChevronRight data-icon="inline-end" />
              </Link>
            </Button>
          ))}
        </div>
      </SettingsSection>
      <SettingsSection title="About">
        <FieldDescription>Habit Tracker · Version {version}</FieldDescription>
        <FieldDescription>
          Backup and data controls are available in the relevant module’s settings.
        </FieldDescription>
      </SettingsSection>
      {ringtoneOpen && <RingtoneDrawerModal isOpen onClose={() => setRingtoneOpen(false)} />}
      <AppearanceDrawerModal isOpen={appearanceOpen} onOpenChange={setAppearanceOpen} />
    </div>
  );
}
