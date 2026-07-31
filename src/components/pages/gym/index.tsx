'use client';

import { useState } from 'react';
import { Dumbbell, Menu } from 'lucide-react';
import { DailyWorkoutView } from './_components/DailyWorkoutView';
import { PlanEditor } from './_components/PlanEditor';
import { GymHistory } from './_components/GymHistory';
import { GymSidebarDrawerModal, GymTab } from './_components/GymSidebarDrawerModal';

export default function GymPage() {
  const [activeTab, setActiveTab] = useState<GymTab>('today');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7fd] dark:bg-zinc-950">
      <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-28 space-y-5">
        {/* Top Header with Sidebar Drawer Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shrink-0"
            title="Open Workout Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Workout Tracker
            </span>
            <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              Gym & Fitness Split <Dumbbell className="w-5 h-5 text-blue-600 animate-pulse" />
            </h1>
          </div>
        </div>

        {/* Active Tab View Content */}
        {activeTab === 'today' && (
          <DailyWorkoutView onGoToPlanEditor={() => setActiveTab('plan')} />
        )}
        {activeTab === 'plan' && <PlanEditor />}
        {activeTab === 'history' && <GymHistory />}
      </div>

      {/* Left Sidebar Navigation Drawer */}
      <GymSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </div>
  );
}
