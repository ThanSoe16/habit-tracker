'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Menu } from 'lucide-react';
import { DailyWorkoutView } from './_components/daily-workout-view';
import { PlanEditor } from './_components/plan-editor';
import { GymHistory } from './_components/gym-history';
import { GymSidebarDrawerModal, GymTab } from './_components/gym-sidebar-drawer-modal';

interface GymPageProps {
  initialTab?: GymTab;
}

export default function GymPage({ initialTab = 'today' }: GymPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<GymTab>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSelectTab = (tab: GymTab) => {
    setActiveTab(tab);
    router.push(`/gym/${tab}`);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950">
      <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-28 space-y-5">
        {/* Top Header matching Home Header layout */}
        <header className="flex justify-between items-center py-1">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
            title="Open Workout Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Gym & Fitness Split <Dumbbell className="w-5 h-5 text-blue-600 animate-pulse" />
          </h1>

          <div className="w-10 h-10" />
        </header>

        {/* Active Tab View Content */}
        {activeTab === 'today' && (
          <DailyWorkoutView onGoToPlanEditor={() => handleSelectTab('plan')} />
        )}
        {activeTab === 'plan' && <PlanEditor />}
        {activeTab === 'history' && <GymHistory />}
      </div>

      {/* Left Sidebar Navigation Drawer */}
      <GymSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />
    </div>
  );
}
