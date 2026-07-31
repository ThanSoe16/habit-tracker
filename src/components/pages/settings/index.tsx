'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  SlidersHorizontal,
  User,
  Bell,
  Moon,
  Sun,
  Layers,
  Eye,
  EyeOff,
  Flame,
  BarChart2,
  LayoutGrid,
  List,
  ArrowUpDown,
  Menu,
} from 'lucide-react';
import { SidebarDrawerModal } from '@/components/pages/home/_components/SidebarDrawerModal';
import { useUserStore, HomeSettings } from '@/store/useUserStore';
import { cn } from '@/utils/cn';

export default function SettingsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    name,
    avatarEmoji,
    theme,
    remindersEnabled,
    dailyReminderTime,
    homeSettings,
    setName,
    setAvatarEmoji,
    setTheme,
    setRemindersEnabled,
    setDailyReminderTime,
    updateHomeSettings,
  } = useUserStore();

  const [editName, setEditName] = useState(name);

  const emojiOptions = ['😊', '⚡', '🔥', '🎯', '🚀', '🧘', '🏋️', '🏃', '💪', '🧠', '🌟', '🏆'];

  const viewOptions: { id: HomeSettings['homeDefaultView']; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'overall', label: 'Overall' },
  ];

  const cardStyleOptions: { id: HomeSettings['cardStyle']; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'detailed', label: 'Detailed Cards', icon: LayoutGrid },
    { id: 'compact', label: 'Compact List', icon: List },
  ];

  const sortOptions: { id: HomeSettings['sortBy']; label: string }[] = [
    { id: 'manual', label: 'Manual Order' },
    { id: 'timeOfDay', label: 'Time of Day' },
    { id: 'status', label: 'Pending First' },
    { id: 'streak', label: 'Top Streak' },
    { id: 'alphabetical', label: 'A – Z' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 text-gray-900 dark:text-white">
      <div className="w-full max-w-lg mx-auto p-4 pb-32 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xs flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
            title="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
            Habit Settings
          </h1>
          <div className="w-10" />
        </header>

        {/* Section 1: User Profile & Theme */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Profile & Appearance
            </h2>
          </div>

          {/* Avatar Emoji Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Avatar Icon
            </label>
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
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Display Name
            </label>
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
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              App Theme
            </label>
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

        {/* Section 2: Home Page Habit Preferences */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Home Page Habit Preferences
            </h2>
          </div>

          {/* Default View Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Default Startup View
            </label>
            <div className="grid grid-cols-3 gap-2">
              {viewOptions.map((opt) => {
                const isSelected = homeSettings.homeDefaultView === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateHomeSettings({ homeDefaultView: opt.id })}
                    className={cn(
                      'py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5',
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

          {/* Card Layout */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Habit Card Layout
            </label>
            <div className="grid grid-cols-2 gap-2">
              {cardStyleOptions.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = homeSettings.cardStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateHomeSettings({ cardStyle: opt.id })}
                    className={cn(
                      'py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100',
                    )}
                  >
                    <IconComp className="w-4 h-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Sort Habits By
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((opt) => {
                const isSelected = homeSettings.sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateHomeSettings({ sortBy: opt.id })}
                    className={cn(
                      'py-2 px-3.5 rounded-xl text-xs font-semibold transition-all border',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-500/40 ring-1 ring-blue-500/30'
                        : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100',
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            {/* Group by Time of Day */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Group by Time of Day</p>
                  <p className="text-[11px] text-gray-400">Morning, Afternoon, Evening sections</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={homeSettings.groupByTimeOfDay}
                onChange={(e) => updateHomeSettings({ groupByTimeOfDay: e.target.checked })}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Hide Completed Habits */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center">
                  {homeSettings.hideCompleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Hide Completed Habits</p>
                  <p className="text-[11px] text-gray-400">Only show pending habits for today</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={homeSettings.hideCompleted}
                onChange={(e) => updateHomeSettings({ hideCompleted: e.target.checked })}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Show Progress Banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Show Progress Banner</p>
                  <p className="text-[11px] text-gray-400">Display summary card at top of Home</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={homeSettings.showProgressBanner}
                onChange={(e) => updateHomeSettings({ showProgressBanner: e.target.checked })}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Show Streak Badges */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Show Streak Badges</p>
                  <p className="text-[11px] text-gray-400">Display flame counter on cards</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={homeSettings.showStreakBadges}
                onChange={(e) => updateHomeSettings({ showStreakBadges: e.target.checked })}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Notifications & Reminders */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Notifications & Reminders
            </h2>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Daily Habit Reminders</p>
              <p className="text-[11px] text-gray-400">Receive morning notification alerts</p>
            </div>
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {remindersEnabled && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Daily Reminder Time
              </label>
              <input
                type="time"
                value={dailyReminderTime}
                onChange={(e) => setDailyReminderTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          )}
        </div>
      </div>

      <SidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentViewMode={homeSettings?.homeDefaultView || 'today'}
        onSelectViewMode={(mode) => router.push(`/home?view=${mode}`)}
      />
    </div>
  );
}
