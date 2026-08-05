'use client';

import { useState } from 'react';
import {
  Menu,
  BarChart2,
  Trophy,
  Dumbbell,
  Flame,
  CheckCircle2,
  TrendingUp,
  Activity,
  Calendar,
  Zap,
} from 'lucide-react';
import { useGymStore } from '@/store/use-gym-store';
import { GymSidebarDrawerModal } from '@/components/pages/gym/_components/gym-sidebar-drawer-modal';
import { cn } from '@/utils/cn';

export default function GymReportsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { history, weeklyPlan, bodyMetricLogs, gymSettings } = useGymStore();

  const isLbs = gymSettings.weightUnit === 'lbs';
  const weightUnitLabel = isLbs ? 'lbs' : 'kg';
  const displayWeight = (kg: number) => (isLbs ? Math.round(kg * 2.20462) : kg);

  const logEntries = Object.values(history);
  const completedWorkouts = logEntries.filter((l) => l.completed).length;

  const totalSetsDone = logEntries.reduce((acc, log) => {
    return acc + log.exercises.reduce((exAcc, ex) => exAcc + ex.completedSets, 0);
  }, 0);

  // Muscle group set counts
  const categoryCounts: Record<string, number> = {
    Chest: 0,
    Back: 0,
    Shoulders: 0,
    Arms: 0,
    Legs: 0,
    Core: 0,
  };

  logEntries.forEach((log) => {
    log.exercises.forEach((ex) => {
      const cat = ex.category || 'Chest';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + ex.completedSets;
    });
  });

  const totalCategorySets = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;

  // Active days count in plan
  const activePlanDaysCount = weeklyPlan.filter((d) => !d.isRestDay).length;
  const consistencyRate = Math.min(100, Math.round((completedWorkouts / Math.max(1, activePlanDaysCount * 4)) * 100));

  // Weight progress diff
  const latestMetric = bodyMetricLogs.length > 0 ? bodyMetricLogs[bodyMetricLogs.length - 1] : null;
  const firstMetric = bodyMetricLogs.length > 0 ? bodyMetricLogs[0] : null;
  const weightDiff = latestMetric && firstMetric ? latestMetric.weight_kg - firstMetric.weight_kg : 0;

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-gray-900 dark:text-white">
      <div className="w-full max-w-lg mx-auto p-4 pb-32 space-y-5">
        {/* Header */}
        <header className="flex justify-between items-center py-1">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
            title="Open Gym Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
            Gym Reports
          </h1>

          <div className="w-10 h-10" />
        </header>

        {/* Section 1: Dark Glassmorphic Summary Hero */}
        <div className="bg-gradient-to-br from-zinc-900 via-blue-950 to-zinc-900 rounded-3xl p-5 text-white shadow-xl shadow-blue-950/30 space-y-4 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <h2 className="font-black text-sm tracking-wide">Workout Performance</h2>
            </div>
            <span className="text-xs font-extrabold bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full">
              {consistencyRate}% Consistency
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                  Completed
                </span>
              </div>
              <p className="text-2xl font-black text-white">{completedWorkouts}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Workouts logged</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Dumbbell className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                  Total Sets
                </span>
              </div>
              <p className="text-2xl font-black text-white">{totalSetsDone}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Sets performed</p>
            </div>
          </div>
        </div>

        {/* Section 2: Muscle Group Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Muscle Group Volume Breakdown
              </h2>
            </div>
            <span className="text-xs font-bold text-gray-400">{totalSetsDone} Sets</span>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, sets]) => {
              const pct = Math.round((sets / totalCategorySets) * 100);
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-800 dark:text-gray-200">{cat}</span>
                    <span className="text-gray-400">
                      {sets} sets ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        cat === 'Chest' && 'bg-blue-600',
                        cat === 'Back' && 'bg-indigo-600',
                        cat === 'Shoulders' && 'bg-purple-600',
                        cat === 'Arms' && 'bg-emerald-600',
                        cat === 'Legs' && 'bg-amber-500',
                        cat === 'Core' && 'bg-pink-600',
                      )}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: 7-Day Routine Split Overview */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Weekly Split Distribution
              </h2>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {activePlanDaysCount} Active Days
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {weeklyPlan.map((day, idx) => (
              <div
                key={day.dayIndex}
                className={cn(
                  'p-2 rounded-xl text-center flex flex-col items-center justify-center space-y-1 border',
                  day.isRestDay
                    ? 'bg-gray-50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-800 text-gray-400'
                    : 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400',
                )}
              >
                <span className="text-[10px] font-black uppercase">
                  {day.dayName.slice(0, 3)}
                </span>
                {day.isRestDay ? (
                  <span className="text-[9px] font-bold opacity-60">Rest</span>
                ) : (
                  <Zap className="w-3.5 h-3.5 fill-current" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Left Sidebar Navigation Drawer */}
      <GymSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
