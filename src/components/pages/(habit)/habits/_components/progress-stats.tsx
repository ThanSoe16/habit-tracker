'use client';

import { useHabitStore } from '@/store/use-habit-store';
import { ArrowLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProgressStatsProps {
  onBack?: () => void;
}

export function ProgressStats({ onBack }: ProgressStatsProps) {
  const router = useRouter();
  const { habits } = useHabitStore();

  const todayStr = new Date().toLocaleDateString('en-CA');

  const finishedCount = habits.reduce((acc, h) => {
    const entry = h.history[todayStr];
    const isDone = typeof entry === 'boolean' ? entry : !!entry?.completed;
    return acc + (isDone ? 1 : 0);
  }, 0);

  const maxStreak = Math.max(1, ...habits.map((h) => h.streak || 1));

  const items = habits.length > 0 ? habits.slice(0, 4) : [];

  const defaultPillColors = ['#d946ef', '#ec4899', '#f97316', '#8b5cf6'];

  const pillItems =
    items.length > 0
      ? items.map((h, idx) => ({
          name: h.name.split(' ')[0],
          streak: `${h.streak || 1}d`,
          color: h.color || defaultPillColors[idx % defaultPillColors.length],
        }))
      : [
          { name: 'Everyday', streak: '6d', color: '#d946ef' },
          { name: 'Second', streak: '4d', color: '#ec4899' },
          { name: 'TIME', streak: '1d', color: '#f97316' },
          { name: 'Monday', streak: '5d', color: '#8b5cf6' },
        ];

  return (
    <div className="bg-white dark:bg-card rounded-[2.5rem] p-6 text-gray-900 dark:text-white relative shadow-xl dark:shadow-2xl border border-gray-100 dark:border-zinc-800 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start pt-1">
        <h1 className="text-2xl font-black leading-tight max-w-[200px] text-gray-900 dark:text-white">
          Your progress and insights
        </h1>
        <button
          type="button"
          onClick={() => (onBack ? onBack() : router.push('/today'))}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Pill Arch Bar Chart */}
      <div className="pt-8 pb-2">
        <div className="grid grid-cols-4 gap-2.5 items-end">
          {pillItems.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div
                className="w-full h-16 rounded-t-full flex items-center justify-center transition-all hover:scale-105"
                style={{ backgroundColor: item.color }}
              >
                <span className="text-xs font-black text-white drop-shadow-xs">{item.streak}</span>
              </div>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 truncate max-w-full text-center">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Points & Stats Card */}
      <div className="bg-background dark:bg-background rounded-[2rem] p-5 space-y-5 border border-gray-100 dark:border-white/5 shadow-inner">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-extrabold text-base text-gray-900 dark:text-white">Points Earned</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">For this week</p>
          </div>
          <span className="text-xl font-black text-orange-600">842 Points</span>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-gray-200 dark:border-white/10 pt-4 text-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1">Habits</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{habits.length || 4}</p>
          </div>
          <div className="border-x border-gray-200 dark:border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1">Finished</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{finishedCount || 4}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1">Streak</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{maxStreak || 6}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'My Habit Progress',
                text: `I've completed ${finishedCount} habits today with a ${maxStreak} day streak!`,
              });
            }
          }}
          className="w-full bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-black py-3.5 rounded-full text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
        >
          Share Progress
        </button>
      </div>
    </div>
  );
}
