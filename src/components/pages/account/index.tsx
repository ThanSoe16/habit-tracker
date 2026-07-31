'use client';

import { ProfileCard } from './_components/ProfileCard';
import { QuickStats } from './_components/QuickStats';
import { SettingsList } from './_components/SettingsList';
import { DangerZone } from './_components/DangerZone';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fd] dark:bg-zinc-950 text-foreground">
      <div className="w-full max-w-lg mx-auto p-4 pb-32 space-y-5">
        <ProfileCard />
        <QuickStats />
        <SettingsList />
        <DangerZone />
      </div>
    </div>
  );
}
