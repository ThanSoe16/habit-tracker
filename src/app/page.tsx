'use client';
import { AuthGuard } from '@/components/providers/auth-guard';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/use-user-store';
import { SettingsLoading, SettingsSaveStatus } from '@/components/settings/settings-controls';
export default function RootPage() {
  const router = useRouter();
  const { isLoaded, homeSettings } = useUserStore();
  useEffect(() => {
    if (isLoaded) router.replace(`/habits/${homeSettings.homeDefaultView}`);
  }, [isLoaded, homeSettings.homeDefaultView, router]);
  return (
    <AuthGuard>
      <div className="mx-auto max-w-lg p-6">
        <SettingsSaveStatus />
        <SettingsLoading />
      </div>
    </AuthGuard>
  );
}
