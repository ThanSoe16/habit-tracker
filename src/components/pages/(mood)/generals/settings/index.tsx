'use client';
import { useUserStore } from '@/store/use-user-store';
import {
  AppSettingsLink,
  SettingsLoading,
  SettingsSaveStatus,
  SettingsSection,
  SettingsSwitch,
} from '@/components/settings/settings-controls';
import { NotificationPreferences } from '@/components/settings/notification-preferences';

export default function MoodGeneralsSettingsPage() {
  const { moodSettings, updateMoodSettings, isLoaded } = useUserStore();
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 pb-8">
      <SettingsSaveStatus />
      {isLoaded ? (
        <>
          <SettingsSection
            title="Check-in reminders"
            description="These reminders are independent of your habit reminders."
          >
            <NotificationPreferences scope="mood" />
          </SettingsSection>
          <SettingsSection title="Mood tracking">
            <SettingsSwitch
              label="Journaling notes"
              description="Show the reflection field when logging a mood. Existing notes are kept."
              checked={moodSettings.enableNotes}
              onCheckedChange={(enableNotes) => updateMoodSettings({ enableNotes })}
            />
            <SettingsSwitch
              label="Mood streak"
              description="Show your consecutive days of mood check-ins."
              checked={moodSettings.showStreak}
              onCheckedChange={(showStreak) => updateMoodSettings({ showStreak })}
            />
          </SettingsSection>
        </>
      ) : (
        <SettingsLoading />
      )}
      <AppSettingsLink />
    </div>
  );
}
