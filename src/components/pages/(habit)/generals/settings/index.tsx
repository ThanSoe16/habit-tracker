'use client';

import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SettingsList } from '@/components/pages/account/_components/settings-list';
import { ProfileCard } from '@/components/pages/account/_components/profile-card';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-gray-900 dark:text-white p-4 pb-28">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header with SidebarTrigger */}
        <header className="flex justify-between items-center py-1">
          <SidebarTrigger className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors" />

          <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
            Settings
          </h1>

          <div className="w-10 h-10" />
        </header>

        <ProfileCard />
        <SettingsList />
      </div>
    </div>
  );
}
