'use client';
import { useSettingsRouter } from '@/features/settings/use-unsaved-changes';

import { ChevronLeft } from 'lucide-react';
import { SettingsContent } from '@/components/shared/settings/settings-content';
import { SettingsPageHeader } from '@/components/shared/settings/settings-page-header';
import { SettingsSaveStatus } from '@/components/settings/settings-controls';
import { Button } from '@/components/ui/button';
import { ProfileCard } from './_components/profile-card';
import { QuickStats } from './_components/quick-stats';
import { SettingsList } from './_components/settings-list';

export default function AccountPage() {
  const router = useSettingsRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-4 pt-6 pb-28">
        <SettingsContent>
          <SettingsPageHeader
            title="Account & settings"
            description="Your profile, app preferences, and settings in one place."
            navigation={
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => router.back()}
                className="size-10 rounded-xl shadow-xs"
                aria-label="Go back"
              >
                <ChevronLeft />
              </Button>
            }
          />
          <SettingsSaveStatus />
          <ProfileCard />
          <QuickStats />
          <SettingsList />
        </SettingsContent>
      </div>
    </div>
  );
}
