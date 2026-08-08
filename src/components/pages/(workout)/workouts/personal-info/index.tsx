'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Edit3,
  Calendar,
  Sparkles,
  Target,
  Scale,
  Flame,
  Plus,
  Zap,
  Activity,
  Heart,
  ChevronRight,
  ShoppingBag,
  Droplet,
  Droplets,
  RotateCcw,
  Flag,
  ArrowUpRight,
  HelpCircle,
} from 'lucide-react';
import {
  useGymStore,
  cmToFtIn,
  kgToLbs,
  lbsToKg,
  calculateAge,
} from '@/store/use-gym-store';
import { EditWaterGoalModal } from '../hydration-progress/_components/edit-water-goal-modal';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

export default function GymProfilePage() {
  const router = useRouter();
  const {
    gymSettings,
    updateGymSettings,
    setHydrationGoal,
    logWaterIntake,
    setDailyWaterIntake,
    bodyMetricLogs,
    addBodyMetricLog,
  } = useGymStore();

  const isLbs = gymSettings.weightUnit === 'lbs';
  const weightUnit = isLbs ? 'lbs' : 'kg';

  // Latest log or fallback to settings
  const latestLog = bodyMetricLogs.length > 0 ? bodyMetricLogs[bodyMetricLogs.length - 1] : null;

  // Active state: prioritize user's current gymSettings
  const heightCm = gymSettings.heightCm || latestLog?.height_cm || 175;
  const currentWeightKg = gymSettings.currentWeightKg || latestLog?.weight_kg || 64;
  const targetWeightKg = gymSettings.targetWeightKg || latestLog?.target_weight_kg || 65;
  const dob = gymSettings.dob || latestLog?.dob || '1998-05-15';
  const gender = gymSettings.gender || latestLog?.gender || 'Male';
  const fitnessGoal = gymSettings.fitnessGoal || latestLog?.fitness_goal || 'Muscle Gain';
  const bodyFatPct = gymSettings.bodyFatPct ?? (latestLog?.body_fat_pct || 18);
  const activityLevel = gymSettings.activityLevel || latestLog?.activity_level || 'Moderately Active';

  // Hydration state
  const goalMl = gymSettings.hydrationGoalMl || 2500;
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayLoggedMl = gymSettings.dailyHydrationLogs[todayStr] || 0;
  const waterProgressPercent = Math.min(100, Math.round((todayLoggedMl / goalMl) * 100));

  // Quick weight log modal
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickWeight, setQuickWeight] = useState(isLbs ? kgToLbs(currentWeightKg) : currentWeightKg);
  const [quickFat, setQuickFat] = useState(bodyFatPct || 18);

  // Height display (CM + FT-IN)
  const { feet, inches } = cmToFtIn(heightCm);

  // Weight display helper
  const displayWeight = (kg: number) => (isLbs ? kgToLbs(kg) : Math.round(kg * 10) / 10);
  const currentWeightDisp = displayWeight(currentWeightKg);
  const targetWeightDisp = displayWeight(targetWeightKg);

  // Age calculation
  const age = calculateAge(dob) || 26;

  // Weight difference to target (Screenshot 1)
  const diffKg = Math.round((currentWeightKg - targetWeightKg) * 10) / 10;
  const isLosing = targetWeightKg < currentWeightKg;
  const isAchieved = currentWeightKg === targetWeightKg;

  // Milestone Progress Percentage
  const firstLog = bodyMetricLogs.length > 0 ? bodyMetricLogs[0] : null;
  const startWeightKg = firstLog?.weight_kg || gymSettings.startWeightKg || currentWeightKg;
  const totalChange = Math.abs(startWeightKg - targetWeightKg);
  const changeDone = Math.abs(startWeightKg - currentWeightKg);
  const progressPct =
    totalChange > 0
      ? Math.min(100, Math.max(10, Math.round((changeDone / totalChange) * 100)))
      : 10;

  // BMI calculations
  const heightM = heightCm / 100;
  const bmiVal = heightM > 0 ? currentWeightKg / (heightM * heightM) : 22.0;
  const bmiStr = bmiVal.toFixed(1);
  const minHealthyKg = Math.round(18.5 * (heightM * heightM) * 10) / 10;
  const maxHealthyKg = Math.round(24.9 * (heightM * heightM) * 10) / 10;

  // BMR & TDEE Calculations
  const isMale = gender === 'Male';
  const bmr = isMale
    ? Math.round(10 * currentWeightKg + 6.25 * heightCm - 5 * age + 5)
    : Math.round(10 * currentWeightKg + 6.25 * heightCm - 5 * age - 161);

  const activityMultipliers: Record<string, number> = {
    Sedentary: 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
  };
  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
  const calorieTarget =
    fitnessGoal === 'Muscle Gain' ? tdee + 300 : fitnessGoal === 'Fat Loss' ? tdee - 500 : tdee;

  // Water Actions
  const handleApplyWaterGoal = (newGoal: number) => {
    setHydrationGoal(newGoal);
    toast.success(`Hydration goal updated to ${newGoal.toLocaleString()} ml! 💧`);
  };

  const handleAddWater = (delta: number) => {
    logWaterIntake(todayStr, delta);
    toast.success(`+${delta} ml logged! 🥤`);
  };

  const handleResetWater = () => {
    setDailyWaterIntake(todayStr, 0);
    toast.info("Today's water intake reset");
  };

  const handleQuickLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputWeightKg = isLbs ? lbsToKg(Number(quickWeight)) : Number(quickWeight);

    await addBodyMetricLog({
      logged_at: todayStr,
      height_cm: heightCm,
      weight_kg: inputWeightKg,
      target_weight_kg: targetWeightKg,
      dob,
      gender,
      fitness_goal: fitnessGoal,
      body_fat_pct: quickFat ? Number(quickFat) : undefined,
      activity_level: activityLevel,
    });
    setShowQuickLog(false);
    toast.success('Logged weight for today! 📈');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0c0f17] text-gray-900 dark:text-white space-y-5 pb-24 max-w-lg mx-auto">
      {/* 1. Header Card */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-5 text-white shadow-xl shadow-indigo-500/20 space-y-4">
        {/* Top Row: Title + Actions */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h1 className="text-lg font-black tracking-tight">Personal Info & Goals</h1>
            <p className="text-xs font-medium text-blue-100/80">
              Track weight, hydration & body metrics
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/managements/edit-personal-info')}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/10 transition-all active:scale-95"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-2xl px-3 py-2.5 text-center border border-white/5">
            <p className="text-lg font-black">{currentWeightDisp}<span className="text-xs ml-0.5 font-bold opacity-70">{weightUnit}</span></p>
            <p className="text-[10px] font-semibold text-blue-100/70 mt-0.5">Current</p>
          </div>
          <div className="bg-white/10 rounded-2xl px-3 py-2.5 text-center border border-white/5">
            <p className="text-lg font-black">{targetWeightDisp}<span className="text-xs ml-0.5 font-bold opacity-70">{weightUnit}</span></p>
            <p className="text-[10px] font-semibold text-blue-100/70 mt-0.5">Target</p>
          </div>
          <div className="bg-white/10 rounded-2xl px-3 py-2.5 text-center border border-white/5">
            <p className="text-lg font-black">{bmiStr}</p>
            <p className="text-[10px] font-semibold text-blue-100/70 mt-0.5">BMI</p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQuickLog(!showQuickLog)}
            className="flex-1 py-2.5 rounded-2xl bg-white text-blue-700 text-xs font-black flex items-center justify-center gap-1.5 shadow-md hover:bg-blue-50 transition-all active:scale-[0.98]"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Log Weight</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/workout/personal-info-history')}
            className="flex-1 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/10 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Quick Weight Log Drawer */}
      {showQuickLog && (
        <form
          onSubmit={handleQuickLogSubmit}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xl border border-blue-500/30 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-500" /> Log Today&apos;s Weight
            </h3>
            <button
              type="button"
              onClick={() => setShowQuickLog(false)}
              className="text-xs text-gray-400 font-bold hover:text-gray-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">Weight ({weightUnit})</label>
              <input
                type="number"
                step="0.1"
                required
                value={quickWeight}
                onChange={(e) => setQuickWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">Body Fat % (optional)</label>
              <input
                type="number"
                step="0.5"
                value={quickFat}
                onChange={(e) => setQuickFat(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white text-xs font-black rounded-2xl shadow-md"
          >
            Save Log
          </button>
        </form>
      )}

      {/* 2. Weight Goal Progress Tracker (Screenshot 1) */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
        {/* On-Track Status Pill */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-black shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span>• On-track!</span>
          </div>

          {/* Big Weight with Bag Icon */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <div className="text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h2 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">
              {currentWeightDisp}
              <span className="text-3xl font-extrabold text-gray-700 dark:text-gray-300">
                {weightUnit}
              </span>
            </h2>
          </div>

          {/* Subtitle difference */}
          <p className="text-base font-extrabold text-gray-800 dark:text-zinc-200">
            {isAchieved
              ? 'Goal Achieved! 🏆'
              : `${isLosing ? 'Lose' : 'Gain'} ${Math.abs(displayWeight(diffKg))}${weightUnit} more!`}
          </p>
        </div>

        {/* Milestone Progress Bar with Flame Thumb & Flag End */}
        <div className="space-y-2 px-1 pt-2">
          <div className="flex justify-between text-xs font-black text-gray-400">
            <span className="text-gray-700 dark:text-gray-300 font-extrabold">
              {currentWeightDisp}
              {weightUnit}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-black">{progressPct}%</span>
            <span className="text-gray-700 dark:text-gray-300 font-extrabold">
              {targetWeightDisp}
              {weightUnit}
            </span>
          </div>

          {/* Track Bar with Moving Thumb & Flag */}
          <div className="relative w-full h-8 flex items-center">
            <div className="w-full h-4 bg-gray-100 dark:bg-zinc-800 rounded-full border border-gray-200/60 dark:border-zinc-700 relative overflow-hidden flex items-center justify-between px-3">
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPct}%` }}
              />
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
      </div>

      {/* 3. Suggested Daily Goal Card (Screenshot 2) */}
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
          onClick={() => setIsWaterModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-extrabold inline-flex items-center gap-2 border border-blue-200/60 dark:border-blue-900/40 transition-colors shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Change Intake</span>
        </button>
      </div>

      {/* 4. Live Daily Hydration Logger Widget (Screenshot 3) */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-300 fill-cyan-300" />
            <h3 className="font-extrabold text-sm">Today&apos;s Hydration</h3>
          </div>
          <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
            {waterProgressPercent}% Drank
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-extrabold text-blue-100">
            <span>{todayLoggedMl.toLocaleString()} ml logged</span>
            <span>{goalMl.toLocaleString()} ml goal</span>
          </div>

          {/* Water Wave Fill Bar */}
          <div className="w-full h-3.5 bg-black/20 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-300 via-sky-200 to-white rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${waterProgressPercent}%` }}
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

      {/* 5. Body Health & Metabolism Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Height & BMI */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-100 dark:border-zinc-800 space-y-1">
          <p className="text-xs font-bold text-gray-400">Height & BMI</p>
          <p className="text-lg font-black text-gray-900 dark:text-white">
            {heightCm} cm{' '}
            <span className="text-xs text-gray-500 font-semibold">
              ({feet}&apos; {inches}&quot;)
            </span>
          </p>
          <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
            BMI: {bmiStr}{' '}
            <span className="text-gray-400 text-[11px] font-normal">
              (Healthy: {minHealthyKg}-{maxHealthyKg}kg)
            </span>
          </p>
        </div>

        {/* Target Calories */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-100 dark:border-zinc-800 space-y-1">
          <p className="text-xs font-bold text-gray-400">Daily Calorie Target</p>
          <p className="text-lg font-black text-gray-900 dark:text-white">
            {calorieTarget.toLocaleString()} <span className="text-xs text-gray-500">kcal</span>
          </p>
          <p className="text-xs font-extrabold text-emerald-500">
            BMR: {bmr} kcal • {fitnessGoal}
          </p>
        </div>
      </div>

      {/* Edit Water Goal Intake Drawer Modal */}
      <EditWaterGoalModal
        isOpen={isWaterModalOpen}
        onClose={() => setIsWaterModalOpen(false)}
        currentGoalMl={goalMl}
        onApply={handleApplyWaterGoal}
      />
    </div>
  );
}
