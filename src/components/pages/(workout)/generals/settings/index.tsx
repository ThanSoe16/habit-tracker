'use client';

import { useState } from 'react';
import { Dumbbell, Timer, Tag, CheckCircle2, User, Moon, Sun, Menu } from 'lucide-react';
import { useGymStore } from '@/store/use-gym-store';
import { useUserStore } from '@/store/use-user-store';
import { cn } from '@/utils/cn';

export default function GymSettingsPage() {
  const { gymSettings, updateGymSettings } = useGymStore();
  const { name, avatarEmoji, theme, setName, setAvatarEmoji, setTheme } = useUserStore();

  const [editName, setEditName] = useState(name);
  const emojiOptions = ['🏋️', '💪', '🏃', '⚡', '🔥', '🎯', '🚀', '🏆'];

  const restTimerOptions = [
    { value: 30, label: '30s' },
    { value: 60, label: '60s' },
    { value: 90, label: '90s' },
    { value: 120, label: '2m' },
    { value: 180, label: '3m' },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-gray-900 dark:text-white">
      {/* Section 1: Gym & Workout Preferences */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
          <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Workout & Split Settings
          </h2>
        </div>

        {/* Weight Unit */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Preferred Weight Unit
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateGymSettings({ weightUnit: 'kg' })}
              className={cn(
                'py-2.5 px-4 rounded-xl text-xs font-bold transition-all border text-center',
                gymSettings.weightUnit === 'kg'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100',
              )}
            >
              Kilograms (kg)
            </button>
            <button
              type="button"
              onClick={() => updateGymSettings({ weightUnit: 'lbs' })}
              className={cn(
                'py-2.5 px-4 rounded-xl text-xs font-bold transition-all border text-center',
                gymSettings.weightUnit === 'lbs'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100',
              )}
            >
              Pounds (lbs)
            </button>
          </div>
        </div>

        {/* Rest Timer Duration */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-gray-400" />
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Default Rest Timer Between Sets
            </label>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {restTimerOptions.map((opt) => {
              const isSelected = gymSettings.restTimerSeconds === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateGymSettings({ restTimerSeconds: opt.value })}
                  className={cn(
                    'py-2 rounded-xl text-xs font-bold transition-all border text-center',
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100',
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Default Target Sets */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Default Sets Per Exercise
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[3, 4, 5].map((sets) => {
              const isSelected = gymSettings.defaultTargetSets === sets;
              return (
                <button
                  key={sets}
                  type="button"
                  onClick={() => updateGymSettings({ defaultTargetSets: sets })}
                  className={cn(
                    'py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center',
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100',
                  )}
                >
                  {sets} Sets
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2">
          {/* Auto-Finish Workout */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Auto-Finish Workout
                </p>
                <p className="text-[11px] text-gray-400">Complete log when all sets are done</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={gymSettings.autoFinishWorkout}
              onChange={(e) => updateGymSettings({ autoFinishWorkout: e.target.checked })}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Show Category Badges */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-blue-600 flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Category Badges</p>
                <p className="text-[11px] text-gray-400">Display Chest, Back, Legs tags</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={gymSettings.showCategoryBadges}
              onChange={(e) => updateGymSettings({ showCategoryBadges: e.target.checked })}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Profile & Theme Appearance */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Profile & Theme
          </h2>
        </div>

        {/* Avatar Emoji */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Avatar Icon</label>
          <div className="flex flex-wrap gap-2">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatarEmoji(emoji)}
                className={cn(
                  'w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all border',
                  avatarEmoji === emoji
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 ring-2 ring-blue-500/20 scale-105'
                    : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 hover:bg-gray-100',
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Display Name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={() => setName(editName || 'User')}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Theme Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">App Theme</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={cn(
                'py-3 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2',
                theme === 'light'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300',
              )}
            >
              <Sun className="w-4 h-4" />
              Light Mode
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={cn(
                'py-3 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2',
                theme === 'dark'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300',
              )}
            >
              <Moon className="w-4 h-4" />
              Dark Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
