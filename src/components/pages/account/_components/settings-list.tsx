'use client';
import { useState } from 'react';
import {
  BellRing,
  Brain,
  Dumbbell,
  Flag,
  Image,
  Info,
  LayoutGrid,
  ListChecks,
  Palette,
  Smile,
  Volume2,
  Wallet,
} from 'lucide-react';
import { Flex, Grid } from '@radix-ui/themes';
import { SettingsAction } from '@/components/shared/settings/settings-action';
import { useUserStore } from '@/store/use-user-store';
import { FieldDescription } from '@/components/ui/field';
import {
  SettingsLoading,
  SettingsSection,
  SettingsSwitch,
} from '@/components/settings/settings-controls';
import { NotificationPreferences } from '@/components/settings/notification-preferences';
import { RingtoneDrawerModal } from './ringtone-drawer-modal';
import { AppearanceDrawerModal } from './appearance-drawer-modal';
import packageInfo from '../../../../../package.json';

const modules = [
  {
    label: 'Habits',
    href: '/generals/settings',
    icon: ListChecks,
    description: 'Views & organization',
  },
  {
    label: 'Workouts',
    href: '/workout-generals/settings',
    icon: Dumbbell,
    description: 'Units & training defaults',
  },
  {
    label: 'Mood',
    href: '/mood-generals/settings',
    icon: Smile,
    description: 'Check-ins & reminders',
  },
  {
    label: 'Budget',
    href: '/budget-generals/settings',
    icon: Wallet,
    description: 'Wallets & backups',
  },
  {
    label: 'Media',
    href: '/store-generals/settings',
    icon: Image,
    description: 'Library & permissions',
  },
  { label: 'Goals', href: '/goals/settings', icon: Flag, description: 'Home & completed goals' },
  {
    label: 'Wellbeing',
    href: '/digital-wellbeing/settings',
    icon: Brain,
    description: 'Focus & daily limits',
  },
];

export function SettingsList() {
  const { ringtone, vibrationEnabled, setVibrationEnabled, theme, appearanceSettings, isLoaded } =
    useUserStore();
  const [ringtoneOpen, setRingtoneOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  return (
    <Flex direction="column" gap="5">
      {isLoaded ? (
        <>
          <SettingsSection
            title="Appearance"
            icon={Palette}
            description="Personalize every module with one shared theme."
          >
            <SettingsAction
              label="Theme & display"
              description={`${theme === 'system' ? 'Device setting' : theme === 'dark' ? 'Dark' : 'Light'} · ${appearanceSettings.accentColor}`}
              onClick={() => setAppearanceOpen(true)}
            />
          </SettingsSection>
          <SettingsSection
            title="Sound & vibration"
            icon={Volume2}
            description="Choose how your alerts sound and feel."
          >
            <SettingsAction
              label="Alarm ringtone"
              description={ringtone.charAt(0).toUpperCase() + ringtone.slice(1)}
              onClick={() => setRingtoneOpen(true)}
            />
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
          <SettingsSection
            title="Habit notifications"
            icon={BellRing}
            description="A gentle nudge to keep your routine on track."
          >
            <NotificationPreferences scope="habit" />
          </SettingsSection>
          <SettingsSection
            title="Mood notifications"
            icon={Smile}
            description="Make time for a daily check-in."
          >
            <NotificationPreferences scope="mood" />
          </SettingsSection>
        </>
      ) : (
        <SettingsLoading />
      )}
      <SettingsSection
        title="Module settings"
        icon={LayoutGrid}
        description="Configure how each part of the app works."
      >
        <Grid columns={{ initial: '1', sm: '2' }} gap="2">
          {modules.map((module) => (
            <SettingsAction key={module.href} {...module} />
          ))}
        </Grid>
      </SettingsSection>
      <SettingsSection title="About" icon={Info}>
        <FieldDescription>Habit Tracker · Version {packageInfo.version}</FieldDescription>
        <FieldDescription>
          Backup and data controls are available in the relevant module’s settings.
        </FieldDescription>
      </SettingsSection>
      {ringtoneOpen && <RingtoneDrawerModal isOpen onClose={() => setRingtoneOpen(false)} />}
      <AppearanceDrawerModal isOpen={appearanceOpen} onOpenChange={setAppearanceOpen} />
    </Flex>
  );
}
