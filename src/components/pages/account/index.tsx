'use client';

import React, { useState } from 'react';
import { Menu, Settings as SettingsIcon } from 'lucide-react';
import { ProfileCard } from './_components/ProfileCard';
import { QuickStats } from './_components/QuickStats';
import { SettingsList } from './_components/SettingsList';
import { AccountSidebarDrawerModal } from './_components/AccountSidebarDrawerModal';

export default function AccountPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7fd] dark:bg-zinc-950 text-foreground">
      <div className="w-full max-w-lg mx-auto p-4 pb-32 space-y-5">
        {/* Header */}
        <header className="flex justify-between items-center py-1">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
            title="Open Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
            Account & Settings
          </h1>

          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <SettingsIcon className="w-5 h-5" />
          </div>
        </header>

        <ProfileCard />
        <QuickStats />
        <SettingsList />
      </div>

      {/* Sidebar Drawer */}
      <AccountSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
