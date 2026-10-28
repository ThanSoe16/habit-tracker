'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SlidersHorizontal } from 'lucide-react';
import { SettingsPageHeader } from '@/components/shared/settings/settings-page-header';
import { SettingsContent } from '@/components/shared/settings/settings-content';
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
    <div className="min-h-screen bg-background px-4 pt-6 pb-28 text-foreground">
      <SettingsContent>
        <SettingsPageHeader
          title="Habit settings"
          description="Make your daily habits feel right for you."
          navigation={
            <SidebarTrigger className="size-10 rounded-xl border border-border bg-card shadow-xs" />
          }
        />
        <SettingsSaveStatus />
        {isLoaded ? (
          <SettingsSection
            title="Habit view"
            icon={SlidersHorizontal}
            description="Choose how your habits are displayed and organized."
          >
            <HabitPreferences />
          </SettingsSection>
        ) : (
          <SettingsLoading />
        )}
        <AppSettingsLink />
      </SettingsContent>
    </div>
  );
}
