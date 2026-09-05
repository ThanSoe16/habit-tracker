'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { HabitPreferences } from '@/components/settings/habit-preferences';
import {
  AppSettingsLink,
  SettingsLoading,
  SettingsSaveStatus,
  SettingsSection,
} from '@/components/settings/settings-controls';
import { useUserStore } from '@/store/use-user-store';

export default function SettingsPage() {
  const isLoaded = useUserStore((state) => state.isLoaded);
  return (
    <div className="min-h-screen bg-background p-4 pb-28 text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <header className="flex items-center gap-3">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Habit settings</h1>
        </header>
        <SettingsSaveStatus />
        {isLoaded ? (
          <SettingsSection
            title="Habit view"
            description="The same preferences are available from the home page’s quick settings."
          >
            <HabitPreferences />
          </SettingsSection>
        ) : (
          <SettingsLoading />
        )}
        <AppSettingsLink />
      </div>
    </div>
  );
}
