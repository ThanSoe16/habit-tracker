'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Scale,
  Calendar,
  Bell,
  ChevronRight,
  Flame,
  Flag,
  Check,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useGymStore, kgToLbs, lbsToKg } from '@/store/use-gym-store';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

const PACES = [
  { id: 'Mild (0.50lbs/wk)', label: 'Mild', pace: '0.50 lbs / week', desc: 'Slow & sustainable' },
  { id: 'Moderate (0.85lbs/wk)', label: 'Moderate', pace: '0.85 lbs / week', desc: 'Steady standard' },
  { id: 'Fast (1.10lbs/wk)', label: 'Fast', pace: '1.10 lbs / week', desc: 'Aggressive fat loss' },
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function WeightGoalProgressPage() {
  const router = useRouter();
  const { gymSettings, setWeightGoal } = useGymStore();

  const isLbs = gymSettings.weightUnit === 'lbs';
  const weightUnit = isLbs ? 'lbs' : 'kg';

  const currentWeightKg = gymSettings.currentWeightKg || 75;
  const initialTargetKg = gymSettings.targetWeightKg || 72;
  const displayWeight = (kg: number) => (isLbs ? kgToLbs(kg) : Math.round(kg * 10) / 10);

  const [targetWeight, setTargetWeight] = useState(displayWeight(initialTargetKg));
  const [deadline, setDeadline] = useState(gymSettings.targetDeadline || 'Jun 13');
  const [weeklyPace, setWeeklyPace] = useState(gymSettings.weeklyPace || 'Fast (1.10lbs/wk)');
  const [reminderDays, setReminderDays] = useState<string[]>(
    gymSettings.reminderDays || ['Mo', 'Tu', 'We'],
  );
  const [reminderFreq, setReminderFreq] = useState(gymSettings.reminderFrequency || 'Active Daily');

  // Modals for editing Target Weight, Deadline, and Reminder
  const [activeModal, setActiveModal] = useState<'target' | 'deadline' | 'reminder' | null>(null);

  // Remaining delta
  const targetWeightInKg = isLbs ? lbsToKg(Number(targetWeight)) : Number(targetWeight);
  const diffKg = Math.round((currentWeightKg - targetWeightInKg) * 10) / 10;
  const isLosing = targetWeightInKg < currentWeightKg;
  const isReached = currentWeightKg === targetWeightInKg;

  // Percentage calculation
  const startWeight = gymSettings.startWeightKg || currentWeightKg;
  const totalChange = Math.abs(startWeight - targetWeightInKg);
  const changeDone = Math.abs(startWeight - currentWeightKg);
  const progressPct =
    totalChange > 0
      ? Math.min(100, Math.max(10, Math.round((changeDone / totalChange) * 100)))
      : 13;

  const handleSaveGoal = () => {
    setWeightGoal({
      targetWeightKg: targetWeightInKg,
      targetDeadline: deadline,
      weeklyPace,
      reminderDays,
      reminderFrequency: reminderFreq,
    });
    toast.success('Weight goal & target plan updated successfully! 🎉');
    router.push('/workout/personal-info');
  };

  const toggleDay = (day: string) => {
    if (reminderDays.includes(day)) {
      if (reminderDays.length > 1) {
        setReminderDays(reminderDays.filter((d) => d !== day));
      }
    } else {
      setReminderDays([...reminderDays, day]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 text-gray-900 dark:text-white flex flex-col justify-between max-w-md mx-auto p-4 sm:p-6 space-y-6 pt-2">
      {/* Hero Goal Summary */}
      <div className="space-y-4">

        {/* Hero Goal Summary */}
        <div className="text-center space-y-2 py-3">
          {/* On-Track Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-black shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span>• On-track!</span>
          </div>

          {/* Big Weight Number with Bag/Scale Icon */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <div className="text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h2 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">
              {displayWeight(currentWeightKg)}
              <span className="text-3xl font-extrabold text-gray-700 dark:text-gray-300">
                {weightUnit}
              </span>
            </h2>
          </div>

          {/* Subtitle difference */}
          <p className="text-base font-extrabold text-gray-800 dark:text-zinc-200">
            {isReached
              ? 'Goal Achieved! 🏆'
              : `${isLosing ? 'Lose' : 'Gain'} ${Math.abs(displayWeight(diffKg))}${weightUnit} more!`}
          </p>
        </div>

        {/* Milestone Progress Bar with Flame Thumb & Flag End */}
        <div className="space-y-2 px-2">
          <div className="flex justify-between text-xs font-black text-gray-400">
            <span className="text-gray-700 dark:text-gray-300">
              {displayWeight(currentWeightKg)}
              {weightUnit}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-extrabold">{progressPct}%</span>
            <span className="text-gray-700 dark:text-gray-300">
              {targetWeight}
              {weightUnit}
            </span>
          </div>

          {/* Track Bar with Thumb & Flag */}
          <div className="relative w-full h-8 flex items-center">
            {/* Background Track with tick marks */}
            <div className="w-full h-4 bg-gray-100 dark:bg-zinc-800 rounded-full border border-gray-200/60 dark:border-zinc-700 relative overflow-hidden flex items-center justify-between px-3">
              {/* Fill progress */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPct}%` }}
              />
              {/* Subtle ticks */}
              {[...Array(9)].map((_, i) => (
                <span
                  key={i}
                  className="w-0.5 h-2 bg-gray-300 dark:bg-zinc-700 relative z-10 opacity-60"
                />
              ))}
            </div>

            {/* Moving Flame Milestone Marker */}
            <div
              className="absolute -top-1 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border-2 border-blue-600 text-blue-600 shadow-md flex items-center justify-center transition-all duration-500 z-20"
              style={{ left: `${Math.max(8, Math.min(92, progressPct))}%` }}
            >
              <Flame className="w-4 h-4 fill-current text-blue-600" />
            </div>

            {/* Target Finish Flag */}
            <div className="absolute right-0 -top-1 w-8 h-8 rounded-full bg-red-500 text-white shadow-md flex items-center justify-center z-20">
              <Flag className="w-4 h-4 fill-current" />
            </div>
          </div>
        </div>

        {/* 3 Config Cards (Target Weight, Deadline, Reminder) */}
        <div className="space-y-3 pt-4">
          {/* 1. Target Weight Card */}
          <button
            type="button"
            onClick={() => setActiveModal('target')}
            className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-blue-50/50 dark:hover:bg-zinc-800 border border-gray-200/70 dark:border-zinc-800 flex items-center justify-between transition-all group shadow-xs text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Target Weight
                </p>
                <p className="text-xs text-gray-400 font-medium">Your target weight</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {targetWeight}
                {weightUnit}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* 2. Deadline Card */}
          <button
            type="button"
            onClick={() => setActiveModal('deadline')}
            className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-blue-50/50 dark:hover:bg-zinc-800 border border-gray-200/70 dark:border-zinc-800 flex items-center justify-between transition-all group shadow-xs text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900 dark:text-white">Deadline</p>
                <p className="text-xs text-gray-400 font-medium">{weeklyPace}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{deadline}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* 3. Reminder Card */}
          <button
            type="button"
            onClick={() => setActiveModal('reminder')}
            className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-blue-50/50 dark:hover:bg-zinc-800 border border-gray-200/70 dark:border-zinc-800 flex items-center justify-between transition-all group shadow-xs text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900 dark:text-white">Reminder</p>
                <p className="text-xs text-gray-400 font-medium">{reminderFreq}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {reminderDays.join(', ')}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Primary Button */}
      <div className="pt-6">
        <button
          type="button"
          onClick={handleSaveGoal}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>Set Goal</span>
          <Check className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 1. Modal: Edit Target Weight */}
      {activeModal === 'target' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 space-y-5 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Set Target Weight
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Target Weight ({weightUnit})
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-lg font-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-blue-600 text-white font-extrabold rounded-2xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit Deadline & Pace */}
      {activeModal === 'deadline' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 space-y-4 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Deadline & Weekly Pace
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Target Date / Deadline
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. Jun 13"
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm font-bold text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Weekly Pace Speed
              </label>
              <div className="space-y-2">
                {PACES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setWeeklyPace(p.id)}
                    className={cn(
                      'w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all',
                      weeklyPace === p.id
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-600 dark:text-blue-400 font-black'
                        : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 text-gray-800 dark:text-gray-300',
                    )}
                  >
                    <div>
                      <p className="text-xs font-extrabold">{p.label}</p>
                      <p className="text-[11px] text-gray-400">{p.desc}</p>
                    </div>
                    {weeklyPace === p.id && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-blue-600 text-white font-extrabold rounded-2xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 3. Modal: Edit Reminder Days */}
      {activeModal === 'reminder' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 space-y-4 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Reminder Days
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Select Reminder Frequency Days
              </label>
              <div className="flex justify-between gap-1">
                {WEEKDAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={cn(
                      'w-10 h-10 rounded-2xl text-xs font-black transition-all flex items-center justify-center border',
                      reminderDays.includes(d)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300',
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-blue-600 text-white font-extrabold rounded-2xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
