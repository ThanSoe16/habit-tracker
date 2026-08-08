'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  Calendar,
  Sparkles,
  Edit3,
  Check,
  Droplets,
  Plus,
  RotateCcw,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { useGymStore, kgToLbs } from '@/store/use-gym-store';
import { EditWaterGoalModal } from './_components/edit-water-goal-modal';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

export default function HydrationGoalProgressPage() {
  const router = useRouter();
  const { gymSettings, setHydrationGoal, logWaterIntake, setDailyWaterIntake } = useGymStore();

  const isLbs = gymSettings.weightUnit === 'lbs';
  const weightUnit = isLbs ? 'lbs' : 'kg';
  const currentWeightKg = gymSettings.currentWeightKg || 75;
  const weightDisplay = isLbs ? `${kgToLbs(currentWeightKg)} lbs` : `${currentWeightKg} kg`;

  const activityLevel = gymSettings.activityLevel || 'Moderately Active';
  const gender = gymSettings.gender || 'Male';

  // Hydration target
  const goalMl = gymSettings.hydrationGoalMl || 2500;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Today's consumed water
  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayLoggedMl = gymSettings.dailyHydrationLogs[todayStr] || 0;
  const progressPercent = Math.min(100, Math.round((todayLoggedMl / goalMl) * 100));

  const handleApplyGoal = (newGoal: number) => {
    setHydrationGoal(newGoal);
    toast.success(`Daily hydration goal set to ${newGoal.toLocaleString()} ml! 💧`);
  };

  const handleAddWater = (delta: number) => {
    logWaterIntake(todayStr, delta);
    toast.success(`+${delta} ml logged! Keep staying hydrated! 🥤`);
  };

  const handleResetWater = () => {
    setDailyWaterIntake(todayStr, 0);
    toast.info("Today's water log reset");
  };

  const handleSetGoal = () => {
    toast.success('Hydration goal active & daily reminders scheduled! 💧');
    router.push('/workout/personal-info');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 text-gray-900 dark:text-white flex flex-col justify-between max-w-md mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              New Goal
            </span>
            <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              Set Hydration Goal
            </h1>
          </div>
          <button
            type="button"
            onClick={() =>
              toast.info('Hydration target is calculated based on 35ml per kg + daily activity burn.')
            }
            className="w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Input Rows (Weight, Daily Activity, Sex) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-2 border border-gray-200/60 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800 shadow-xs">
          {/* Weight */}
          <button
            type="button"
            onClick={() => router.push('/managements/edit-personal-info')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/60 rounded-2xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">Weight</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
              <span>{weightDisplay}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          {/* Daily Activity */}
          <button
            type="button"
            onClick={() => router.push('/managements/edit-personal-info')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/60 rounded-2xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">Daily Activity</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
              <span>{activityLevel}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          {/* Sex / Gender */}
          <button
            type="button"
            onClick={() => router.push('/managements/edit-personal-info')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/60 rounded-2xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">♀️</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">Sex</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
              <span>{gender}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        </div>

        {/* Suggested Daily Goal Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200/60 dark:border-zinc-800 shadow-xs text-center space-y-4">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-500">
            <Sparkles className="w-4 h-4 fill-amber-400 stroke-amber-500" />
            <span>Suggested daily goal</span>
          </div>

          {/* Giant Number */}
          <div className="py-2">
            <h2 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">
              {goalMl.toLocaleString()}
              <span className="text-2xl font-extrabold text-blue-600 ml-1">ml</span>
            </h2>
          </div>

          {/* Change Intake Button */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-extrabold inline-flex items-center gap-2 border border-blue-200/60 dark:border-blue-900/40 transition-colors shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Change Intake</span>
          </button>
        </div>

        {/* Live Daily Hydration Logger Widget */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-300 fill-cyan-300" />
              <h3 className="font-extrabold text-sm">Today&apos;s Hydration</h3>
            </div>
            <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
              {progressPercent}% Drank
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold text-blue-100">
              <span>{todayLoggedMl.toLocaleString()} ml logged</span>
              <span>{goalMl.toLocaleString()} ml goal</span>
            </div>

            {/* Water Wave Bar */}
            <div className="w-full h-3.5 bg-black/20 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-300 via-sky-200 to-white rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Water Add Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleAddWater(250)}
              className="py-2 px-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-center text-xs font-extrabold text-white transition-colors"
            >
              +250ml 🥛
            </button>
            <button
              type="button"
              onClick={() => handleAddWater(500)}
              className="py-2 px-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-center text-xs font-extrabold text-white transition-colors"
            >
              +500ml 💧
            </button>
            <button
              type="button"
              onClick={() => handleAddWater(750)}
              className="py-2 px-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-center text-xs font-extrabold text-white transition-colors"
            >
              +750ml 🫙
            </button>
            <button
              type="button"
              onClick={handleResetWater}
              className="py-2 px-1 bg-white/10 hover:bg-red-500/40 border border-white/10 rounded-xl text-center text-xs font-extrabold text-white transition-colors flex items-center justify-center"
              title="Reset today's water"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Primary Set Goal Button */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleSetGoal}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>Set Goal</span>
          <Check className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Edit Water Goal Intake Modal */}
      <EditWaterGoalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentGoalMl={goalMl}
        onApply={handleApplyGoal}
      />
    </div>
  );
}
