'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { ProgressStats } from '@/components/pages/home/_components/ProgressStats';
import { HabitsCompletedChart } from './_components/HabitsCompletedChart';
import { CompletionRateChart } from './_components/CompletionRateChart';
import { CalendarStats } from './_components/CalendarStats';
import { MoodChart } from './_components/MoodChart';
import { SidebarDrawerModal } from '@/components/pages/home/_components/SidebarDrawerModal';

export default function ReportPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7fd] dark:bg-zinc-950 text-gray-900 dark:text-white">
      <div className="max-w-lg mx-auto p-4 pb-28 space-y-4">
        {/* Header matching HomeHeader layout with Menu Button */}
        <header className="flex justify-between items-center py-1">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
            title="Open Habit Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
            Progress & Insights
          </h1>

          <div className="w-10 h-10" />
        </header>

        <ProgressStats />
        <HabitsCompletedChart />
        <CompletionRateChart />
        <CalendarStats />
        <MoodChart />
      </div>

      {/* Habit Sidebar Drawer Modal */}
      <SidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentViewMode="today"
        onSelectViewMode={() => {}}
      />
    </div>
  );
}
