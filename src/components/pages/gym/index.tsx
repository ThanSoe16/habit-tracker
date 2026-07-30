'use client';

import { useState } from 'react';
import { Dumbbell, Calendar, History, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { DailyWorkoutView } from './_components/DailyWorkoutView';
import { PlanEditor } from './_components/PlanEditor';
import { GymHistory } from './_components/GymHistory';

type GymTab = 'today' | 'plan' | 'history';

export default function GymPage() {
  const [activeTab, setActiveTab] = useState<GymTab>('today');

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-28 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Workout Tracker
          </span>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            Gym & Fitness Split <Dumbbell className="w-6 h-6 text-blue-600 animate-pulse" />
          </h1>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-gray-200/50 dark:border-zinc-700/50">
        <button
          onClick={() => setActiveTab('today')}
          className={cn(
            'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5',
            activeTab === 'today'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Today
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={cn(
            'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5',
            activeTab === 'plan'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
          )}
        >
          <Calendar className="w-3.5 h-3.5" />
          7-Day Plan
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5',
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
          )}
        >
          <History className="w-3.5 h-3.5" />
          History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'today' && (
        <DailyWorkoutView onGoToPlanEditor={() => setActiveTab('plan')} />
      )}
      {activeTab === 'plan' && <PlanEditor />}
      {activeTab === 'history' && <GymHistory />}
    </div>
  );
}
