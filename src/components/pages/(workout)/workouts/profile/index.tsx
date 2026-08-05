'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Scale,
  Ruler,
  Target,
  Plus,
  TrendingDown,
  TrendingUp,
  Activity,
  Calendar,
  Sparkles,
  Flame,
  Award,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';
import { useGymStore } from '@/store/use-gym-store';
import { GymSidebarDrawerModal } from '@/components/pages/gym/_components/gym-sidebar-drawer-modal';
import { cn } from '@/utils/cn';

export default function GymProfilePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { bodyMetricLogs, addBodyMetricLog, gymSettings } = useGymStore();

  const isLbs = gymSettings.weightUnit === 'lbs';

  // Latest metric entry
  const latestLog = bodyMetricLogs.length > 0 ? bodyMetricLogs[bodyMetricLogs.length - 1] : null;

  const [showLogForm, setShowLogForm] = useState(false);
  const [heightCm, setHeightCm] = useState(latestLog?.height_cm || 175);
  const [weightKg, setWeightKg] = useState(latestLog?.weight_kg || 75);
  const [targetWeightKg, setTargetWeightKg] = useState(latestLog?.target_weight_kg || 70);
  const [bodyFatPct, setBodyFatPct] = useState(latestLog?.body_fat_pct || 18);
  const [muscleMassKg, setMuscleMassKg] = useState(latestLog?.muscle_mass_kg || 35);
  const [fitnessGoal, setFitnessGoal] = useState(latestLog?.fitness_goal || 'Muscle Gain');
  const [activityLevel, setActivityLevel] = useState(latestLog?.activity_level || 'Moderately Active');
  const [notes, setNotes] = useState('');

  // Calculate BMI: weight (kg) / (height (m))^2
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '22.0';

  const getBMILabel = (bmiVal: number) => {
    if (bmiVal < 18.5) return { label: 'Underweight', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' };
    if (bmiVal < 25) return { label: 'Normal Weight', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' };
    if (bmiVal < 30) return { label: 'Overweight', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' };
    return { label: 'Obese', color: 'text-red-500 bg-red-50 dark:bg-red-950/40' };
  };

  const bmiInfo = getBMILabel(parseFloat(bmi));

  // Weight conversion helpers
  const displayWeight = (kg: number) => (isLbs ? Math.round(kg * 2.20462) : kg);
  const weightUnitLabel = isLbs ? 'lbs' : 'kg';

  // Calculate weight change from first log
  const firstLog = bodyMetricLogs.length > 0 ? bodyMetricLogs[0] : null;
  const weightDiff = latestLog && firstLog ? latestLog.weight_kg - firstLog.weight_kg : 0;

  // Target progress percentage calculation
  const startWeight = firstLog ? firstLog.weight_kg : weightKg;
  const totalTargetDiff = Math.abs(startWeight - targetWeightKg);
  const currentDiff = Math.abs(weightKg - targetWeightKg);
  const targetProgressPct =
    totalTargetDiff > 0 ? Math.max(0, Math.min(100, Math.round(((totalTargetDiff - currentDiff) / totalTargetDiff) * 100))) : 100;

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toLocaleDateString('en-CA');
    await addBodyMetricLog({
      logged_at: todayStr,
      height_cm: Number(heightCm),
      weight_kg: Number(weightKg),
      target_weight_kg: Number(targetWeightKg),
      body_fat_pct: Number(bodyFatPct),
      muscle_mass_kg: Number(muscleMassKg),
      fitness_goal: fitnessGoal,
      activity_level: activityLevel,
      notes,
    });
    setShowLogForm(false);
  };

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
            Personal Info & Progress
          </h1>

          <button
            type="button"
            onClick={() => setShowLogForm(!showLogForm)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white shadow-md shadow-primary/25 flex items-center justify-center hover:bg-blue-700 transition-all"
            title="Update Metrics"
          >
            <Plus className="w-5 h-5" />
          </button>
        </header>

        {/* Section 1: Current Body Metrics Overview */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏋️</span>
              <h2 className="font-extrabold text-base">Body Metrics Summary</h2>
            </div>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {fitnessGoal}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-0.5">
                Current Weight
              </p>
              <p className="text-lg font-black">
                {displayWeight(weightKg)} <span className="text-xs font-bold">{weightUnitLabel}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-0.5">
                Target Weight
              </p>
              <p className="text-lg font-black">
                {displayWeight(targetWeightKg)} <span className="text-xs font-bold">{weightUnitLabel}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-0.5">
                Height
              </p>
              <p className="text-lg font-black">
                {heightCm} <span className="text-xs font-bold">cm</span>
              </p>
            </div>
          </div>

          {/* BMI & Stats */}
          <div className="flex items-center justify-between bg-black/20 rounded-2xl p-3.5 border border-white/10">
            <div>
              <p className="text-xs font-bold text-blue-100">BMI Index</p>
              <p className="text-xl font-black">{bmi}</p>
            </div>
            <span className={cn('px-3 py-1 rounded-xl text-xs font-black shadow-xs', bmiInfo.color)}>
              {bmiInfo.label}
            </span>
          </div>
        </div>

        {/* Form Drawer / Card */}
        {showLogForm && (
          <form
            onSubmit={handleSaveMetrics}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-blue-100 dark:border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Log Today&apos;s Body Metrics
              </h3>
              <button
                type="button"
                onClick={() => setShowLogForm(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Current Weight ({weightUnitLabel})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Target Weight ({weightUnitLabel})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Body Fat (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Primary Fitness Goal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Muscle Gain', 'Fat Loss', 'Strength', 'Maintenance'].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setFitnessGoal(goal)}
                    className={cn(
                      'py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center',
                      fitnessGoal === goal
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100',
                    )}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-primary/25 transition-all"
            >
              Save Metrics & Progress Log
            </button>
          </form>
        )}

        {/* Section 2: Monthly Progress Analytics */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Monthly Progress Analytics
              </h2>
            </div>
            {weightDiff !== 0 && (
              <span
                className={cn(
                  'text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-full',
                  weightDiff < 0
                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
                )}
              >
                {weightDiff < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {weightDiff > 0 ? `+${weightDiff.toFixed(1)}` : weightDiff.toFixed(1)} {weightUnitLabel}
              </span>
            )}
          </div>

          {/* Goal Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-500">Target Goal Progress</span>
              <span className="text-blue-600 dark:text-blue-400">{targetProgressPct}% Achieved</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${targetProgressPct}%` }}
              />
            </div>
          </div>

          {/* Body Composition Summary */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
              <p className="text-[11px] font-bold text-gray-400">Body Fat %</p>
              <p className="text-lg font-black text-gray-900 dark:text-white mt-0.5">{bodyFatPct}%</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
              <p className="text-[11px] font-bold text-gray-400">Muscle Mass</p>
              <p className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                {displayWeight(muscleMassKg)} {weightUnitLabel}
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => router.push('/gym/history')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              View Full History Logs →
            </button>
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
