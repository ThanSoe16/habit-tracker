'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Smile,
  Bell,
  BookOpen,
  Flame,
  User,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { MoodSidebarDrawerModal } from '@/components/pages/mood/_components/mood-sidebar-drawer-modal';
import { useUserStore } from '@/store/use-user-store';
import { cn } from '@/utils/cn';

export default function MoodSettingsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    name,
    avatarEmoji,
    theme,
    remindersEnabled,
    dailyReminderTime,
    setName,
    setAvatarEmoji,
    setTheme,
    setRemindersEnabled,
    setDailyReminderTime,
  } = useUserStore();

  const [editName, setEditName] = useState(name);
  const [moodReminders, setMoodReminders] = useState(remindersEnabled);
  const [moodReminderTime, setMoodReminderTime] = useState(dailyReminderTime || '20:00');
  const [enableNotes, setEnableNotes] = useState(true);
  const [showStreak, setShowStreak] = useState(true);

  const emojiOptions = ['😊', '😎', '🧘', '🌟', '🕊️', '🌈', '🎯', '🔥'];

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-gray-900 dark:text-white">
      <div className="w-full max-w-lg mx-auto p-4 pb-32 space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center py-1">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
            title="Open Mood Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
            Mood Settings
          </h1>
          <div className="w-10 h-10" />
        </header>

        {/* Section 1: Mood Tracking Preferences */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <Smile className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Mood Tracking & Reminders
            </h2>
          </div>

          {/* Reminders Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Daily Mood Check-in</p>
                <p className="text-[11px] text-gray-400">Receive evening mood prompt alert</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={moodReminders}
              onChange={(e) => {
                setMoodReminders(e.target.checked);
                setRemindersEnabled(e.target.checked);
              }}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {moodReminders && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Daily Check-in Time
              </label>
              <input
                type="time"
                value={moodReminderTime}
                onChange={(e) => {
                  setMoodReminderTime(e.target.value);
                  setDailyReminderTime(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          )}

          {/* Journaling Notes Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Journaling Notes</p>
                <p className="text-[11px] text-gray-400">Allow writing reflection notes with mood</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableNotes}
              onChange={(e) => setEnableNotes(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Mood Streak Counter */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Display Mood Streak</p>
                <p className="text-[11px] text-gray-400">Track consecutive logging streak days</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={showStreak}
              onChange={(e) => setShowStreak(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Section 2: Profile & Theme */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Profile & Theme
            </h2>
          </div>

          {/* Avatar Emoji */}
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
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 ring-2 ring-indigo-500/20 scale-105'
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
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
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
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
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
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
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

      <MoodSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
