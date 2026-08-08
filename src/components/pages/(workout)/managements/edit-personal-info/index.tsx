'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Save,
  Calendar,
  Sparkles,
  Target,
  Scale,
  Flame,
  Check,
  ShoppingBag,
  Droplet,
  ChevronRight,
  X,
  Droplets,
} from 'lucide-react';
import {
  useGymStore,
  cmToFtIn,
  ftInToCm,
  kgToLbs,
  lbsToKg,
  calculateAge,
} from '@/store/use-gym-store';
import { gymService } from '@/lib/supabase/services';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

const GOALS = [
  { id: 'Muscle Gain', label: 'Muscle Gain', icon: '💪', desc: 'Hypertrophy & Lean Bulk' },
  { id: 'Fat Loss', label: 'Fat Loss & Shred', icon: '🔥', desc: 'Caloric Deficit & Definition' },
  { id: 'Strength', label: 'Strength & Power', icon: '⚡', desc: 'Heavy Compound Progression' },
  { id: 'Maintenance', label: 'Maintenance', icon: '⚖️', desc: 'Sustain Current Physique' },
  { id: 'Endurance', label: 'Athletic & Endurance', icon: '🏃', desc: 'Cardiovascular & Stamina' },
];

const PACES = [
  { id: 'Mild (0.50lbs/wk)', label: 'Mild', pace: '0.50 lbs / week', desc: 'Slow & sustainable' },
  { id: 'Moderate (0.85lbs/wk)', label: 'Moderate', pace: '0.85 lbs / week', desc: 'Steady standard' },
  { id: 'Fast (1.10lbs/wk)', label: 'Fast', pace: '1.10 lbs / week', desc: 'Aggressive fat loss' },
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const WATER_PRESETS = [2750, 3000, 3250, 3500];

const ACTIVITY_LEVELS = [
  { id: 'Sedentary', label: 'Sedentary', desc: 'Little or no exercise, desk job' },
  { id: 'Lightly Active', label: 'Lightly Active', desc: '1-3 days of exercise / week' },
  { id: 'Moderately Active', label: 'Moderately Active', desc: '3-5 days of moderate workouts' },
  { id: 'Very Active', label: 'Very Active', desc: '6-7 days of heavy training / physical job' },
];

export default function EditGymProfilePage() {
  const router = useRouter();
  const { gymSettings, updateGymSettings, addBodyMetricLog } = useGymStore();

  // Unit selections
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft-in'>(gymSettings.heightUnit || 'cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(gymSettings.weightUnit || 'kg');

  // Height state
  const initialHeightCm = gymSettings.heightCm || 175;
  const initialFtIn = cmToFtIn(initialHeightCm);
  const [heightCm, setHeightCm] = useState(initialHeightCm);
  const [heightFt, setHeightFt] = useState(initialFtIn.feet);
  const [heightIn, setHeightIn] = useState(initialFtIn.inches);

  // Weight state
  const initialWeightKg = gymSettings.currentWeightKg || 75;
  const initialTargetWeightKg = gymSettings.targetWeightKg || 70;
  const [weightVal, setWeightVal] = useState(
    weightUnit === 'lbs' ? kgToLbs(initialWeightKg) : initialWeightKg,
  );
  const [targetWeightVal, setTargetWeightVal] = useState(
    weightUnit === 'lbs' ? kgToLbs(initialTargetWeightKg) : initialTargetWeightKg,
  );

  // Target Goal Details (Screenshot 1)
  const [deadline, setDeadline] = useState(gymSettings.targetDeadline || 'Jun 13');
  const [weeklyPace, setWeeklyPace] = useState(gymSettings.weeklyPace || 'Fast (1.10lbs/wk)');
  const [reminderDays, setReminderDays] = useState<string[]>(
    gymSettings.reminderDays || ['Mo', 'Tu', 'We'],
  );
  const [reminderFreq, setReminderFreq] = useState(gymSettings.reminderFrequency || 'Active Daily');

  // Hydration Goal Details (Screenshot 2)
  const [hydrationGoal, setHydrationGoal] = useState<number>(gymSettings.hydrationGoalMl || 2500);

  // Profile details
  const [dob, setDob] = useState(gymSettings.dob || '1998-05-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(gymSettings.gender || 'Male');
  const [fitnessGoal, setFitnessGoal] = useState(gymSettings.fitnessGoal || 'Muscle Gain');
  const [activityLevel, setActivityLevel] = useState(gymSettings.activityLevel || 'Moderately Active');
  const [bodyFatPct, setBodyFatPct] = useState(gymSettings.bodyFatPct || 18);
  const [isSaving, setIsSaving] = useState(false);

  // Modal dialog states for mini-pickers
  const [activeModal, setActiveModal] = useState<'target' | 'deadline' | 'reminder' | null>(null);

  // Real-time Age
  const calculatedAge = calculateAge(dob);

  // Height Unit Switcher handlers
  const handleHeightUnitToggle = (newUnit: 'cm' | 'ft-in') => {
    setHeightUnit(newUnit);
    if (newUnit === 'ft-in') {
      const converted = cmToFtIn(heightCm);
      setHeightFt(converted.feet);
      setHeightIn(converted.inches);
    } else {
      const convertedCm = ftInToCm(heightFt, heightIn);
      setHeightCm(convertedCm);
    }
  };

  // Weight Unit Switcher handlers
  const handleWeightUnitToggle = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === weightUnit) return;
    setWeightUnit(newUnit);
    if (newUnit === 'lbs') {
      setWeightVal(kgToLbs(weightVal));
      setTargetWeightVal(kgToLbs(targetWeightVal));
    } else {
      setWeightVal(lbsToKg(weightVal));
      setTargetWeightVal(lbsToKg(targetWeightVal));
    }
  };

  const toggleReminderDay = (day: string) => {
    if (reminderDays.includes(day)) {
      if (reminderDays.length > 1) {
        setReminderDays(reminderDays.filter((d) => d !== day));
      }
    } else {
      setReminderDays([...reminderDays, day]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      // Compute normalized metric values in cm and kg
      const finalHeightCm = heightUnit === 'ft-in' ? ftInToCm(heightFt, heightIn) : Number(heightCm);
      const finalWeightKg = weightUnit === 'lbs' ? lbsToKg(weightVal) : Number(weightVal);
      const finalTargetWeightKg =
        weightUnit === 'lbs' ? lbsToKg(targetWeightVal) : Number(targetWeightVal);

      // 1. Update gym store settings
      updateGymSettings({
        heightUnit,
        weightUnit,
        heightCm: finalHeightCm,
        heightFt,
        heightIn,
        currentWeightKg: finalWeightKg,
        targetWeightKg: finalTargetWeightKg,
        targetDeadline: deadline,
        weeklyPace,
        reminderDays,
        reminderFrequency: reminderFreq,
        hydrationGoalMl: hydrationGoal,
        dob,
        gender,
        fitnessGoal,
        activityLevel,
        bodyFatPct: Number(bodyFatPct),
      });

      // 2. Persist to Supabase gym settings
      await gymService.saveGymSettings({
        heightUnit,
        weightUnit,
        heightCm: finalHeightCm,
        heightFt,
        heightIn,
        currentWeightKg: finalWeightKg,
        targetWeightKg: finalTargetWeightKg,
        targetDeadline: deadline,
        weeklyPace,
        reminderDays,
        reminderFrequency: reminderFreq,
        hydrationGoalMl: hydrationGoal,
        dob,
        gender,
        fitnessGoal,
        activityLevel,
        bodyFatPct: Number(bodyFatPct),
      });

      // 3. Add to body metrics history log for today
      const todayStr = new Date().toLocaleDateString('en-CA');
      await addBodyMetricLog({
        logged_at: todayStr,
        height_cm: finalHeightCm,
        weight_kg: finalWeightKg,
        target_weight_kg: finalTargetWeightKg,
        dob,
        gender,
        fitness_goal: fitnessGoal,
        activity_level: activityLevel,
        body_fat_pct: Number(bodyFatPct),
      });

      toast.success('Personal info, weight goals & hydration updated successfully! 🎉');
      router.push('/workout/personal-info');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-gray-900 dark:text-white space-y-4 pb-20 pt-2">
      <form onSubmit={handleSave} className="space-y-4 max-w-lg mx-auto">
        {/* Section 1: Gender & Date of Birth */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <User className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Basic Profile Details
            </h2>
          </div>

          {/* Gender Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Male', label: '👨 Male' },
                { id: 'Female', label: '👩 Female' },
                { id: 'Other', label: '⚧ Other' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGender(item.id as any)}
                  className={cn(
                    'py-2.5 px-3 rounded-2xl text-xs font-bold border text-center transition-all',
                    gender === item.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 font-black'
                      : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date of Birth & Calculated Age */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Date of Birth (DOB)
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Calculated Age
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-100 dark:bg-zinc-800/60 text-xs font-black text-blue-600 dark:text-blue-400 flex items-center justify-between border border-transparent">
                <span>{calculatedAge !== null ? `${calculatedAge} years old` : 'Enter DOB'}</span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Height (FT-IN / CM) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Height Measurement
              </h2>
            </div>

            {/* Height Unit Toggle Pill */}
            <div className="bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-xl flex items-center gap-1 border border-gray-200/50 dark:border-zinc-700/50">
              <button
                type="button"
                onClick={() => handleHeightUnitToggle('cm')}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all',
                  heightUnit === 'cm'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white',
                )}
              >
                CM
              </button>
              <button
                type="button"
                onClick={() => handleHeightUnitToggle('ft-in')}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all',
                  heightUnit === 'ft-in'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white',
                )}
              >
                FT-IN
              </button>
            </div>
          </div>

          {heightUnit === 'cm' ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Height in Centimeters (cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={50}
                  max={250}
                  required
                  value={heightCm}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setHeightCm(val);
                    const converted = cmToFtIn(val);
                    setHeightFt(converted.feet);
                    setHeightIn(converted.inches);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="175"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  {cmToFtIn(heightCm).feet}&apos; {cmToFtIn(heightCm).inches}&quot;
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Feet (ft)
                </label>
                <input
                  type="number"
                  min={3}
                  max={8}
                  required
                  value={heightFt}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setHeightFt(val);
                    setHeightCm(ftInToCm(val, heightIn));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Inches (in)
                </label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  required
                  value={heightIn}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setHeightIn(val);
                    setHeightCm(ftInToCm(heightFt, val));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Current Weight & Target Goal Cards (Screenshot 1) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Weight & Goal Settings
              </h2>
            </div>

            {/* Weight Unit Toggle Pill */}
            <div className="bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-xl flex items-center gap-1 border border-gray-200/50 dark:border-zinc-700/50">
              <button
                type="button"
                onClick={() => handleWeightUnitToggle('kg')}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all',
                  weightUnit === 'kg'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white',
                )}
              >
                KG
              </button>
              <button
                type="button"
                onClick={() => handleWeightUnitToggle('lbs')}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all',
                  weightUnit === 'lbs'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white',
                )}
              >
                LB
              </button>
            </div>
          </div>

          {/* Current Weight Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Current Weight ({weightUnit})
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={weightVal}
              onChange={(e) => setWeightVal(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Target Goal Setting Cards (Matching Screenshot 1) */}
          <div className="space-y-2.5 pt-2">
            {/* 1. Target Weight Card */}
            <button
              type="button"
              onClick={() => setActiveModal('target')}
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-blue-50/50 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-700/60 flex items-center justify-between transition-all group shadow-xs text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold shadow-xs">
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
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  {targetWeightVal}
                  {weightUnit}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* Section 4: Edit Water Goal Intake (Matching Screenshot 2) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <Droplets className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Edit Water Goal Intake
            </h2>
          </div>

          {/* Giant Number Display */}
          <div className="text-center space-y-1 py-1">
            <h2 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">
              {hydrationGoal.toLocaleString()}{' '}
              <span className="text-2xl font-extrabold text-blue-600">ml</span>
            </h2>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              I wanna drink {hydrationGoal.toLocaleString()} ml daily.
            </p>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-2 px-2">
            <input
              type="range"
              min={1000}
              max={5000}
              step={50}
              value={hydrationGoal}
              onChange={(e) => setHydrationGoal(Number(e.target.value))}
              className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />
            <div className="flex justify-between text-[11px] font-bold text-gray-400">
              <span>1,000 ml</span>
              <span>3,000 ml</span>
              <span>5,000 ml</span>
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            {WATER_PRESETS.map((chipVal) => (
              <button
                key={chipVal}
                type="button"
                onClick={() => setHydrationGoal(chipVal)}
                className={cn(
                  'px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-2xs',
                  hydrationGoal === chipVal
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 font-black'
                    : 'bg-blue-50/70 dark:bg-zinc-800 border-blue-100 dark:border-zinc-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100',
                )}
              >
                <Droplet className="w-3.5 h-3.5 fill-current" />
                <span>{chipVal.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 5: Current Gym Goal & Activity */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Current Gym Goal & Activity
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {GOALS.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setFitnessGoal(goal.id)}
                className={cn(
                  'p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center justify-between gap-1.5 relative',
                  fitnessGoal === goal.id
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-600 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10 font-black'
                    : 'bg-gray-50 dark:bg-zinc-800/60 border-gray-100 dark:border-zinc-800 hover:bg-gray-100 text-gray-900 dark:text-white',
                )}
              >
                {fitnessGoal === goal.id && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
                <span className="text-3xl py-1">{goal.icon}</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-black leading-tight">{goal.label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight">
                    {goal.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Level */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Activity Level (for BMR & TDEE Calculations)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setActivityLevel(lvl.id)}
                  className={cn(
                    'p-2.5 rounded-2xl text-left border transition-all',
                    activityLevel === lvl.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100',
                  )}
                >
                  <p className="text-xs font-bold">{lvl.label}</p>
                  <p
                    className={cn(
                      'text-[10px]',
                      activityLevel === lvl.id ? 'text-blue-100' : 'text-gray-400',
                    )}
                  >
                    {lvl.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save & Update Profile'}</span>
          </button>
        </div>
      </form>

      {/* 1. Drawer: Edit Target Weight */}
      {activeModal === 'target' && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-t-[32px] sm:rounded-3xl w-full max-w-md p-6 pb-12 sm:pb-6 space-y-5 border-t sm:border border-gray-100 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Top Drag Handle */}
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-2" />

            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Set Target Weight
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
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
                value={targetWeightVal}
                onChange={(e) => setTargetWeightVal(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-lg font-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
