'use client';

import React from 'react';
import {
  Smile,
  Heart,
  Tag,
} from 'lucide-react';
import { useMoodStore } from '@/store/use-mood-store';
import { cn } from '@/utils/cn';

export default function MoodGeneralsReportsPage() {
  const { history } = useMoodStore();

  const entries = Object.values(history);
  const totalEntries = entries.length;

  // Calculate mood counts
  const moodCounts: Record<string, { emoji: string; count: number }> = {
    Awesome: { emoji: '🤩', count: 0 },
    Good: { emoji: '😊', count: 0 },
    Okay: { emoji: '😐', count: 0 },
    Sad: { emoji: '😔', count: 0 },
    Stressed: { emoji: '😫', count: 0 },
  };

  const tagCounts: Record<string, number> = {};

  entries.forEach((e) => {
    const label = e.label || 'Okay';
    if (!moodCounts[label]) {
      moodCounts[label] = { emoji: e.emoji || '😊', count: 0 };
    }
    moodCounts[label].count += 1;

    if (e.tag) {
      tagCounts[e.tag] = (tagCounts[e.tag] || 0) + 1;
    }
  });

  // Calculate most frequent mood
  let mostFrequentMood = 'Good';
  let maxCount = 0;
  Object.entries(moodCounts).forEach(([label, info]) => {
    if (info.count > maxCount) {
      maxCount = info.count;
      mostFrequentMood = label;
    }
  });

  const positiveCount = (moodCounts['Awesome']?.count || 0) + (moodCounts['Good']?.count || 0);
  const positivePct = totalEntries > 0 ? Math.round((positiveCount / totalEntries) * 100) : 100;

  return (
    <div className="space-y-5">
      {/* Hero Card: Emotional Well-being */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-5 text-white shadow-xl shadow-indigo-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-200 animate-pulse fill-current" />
            <h2 className="font-extrabold text-base">Emotional Well-Being</h2>
          </div>
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            {positivePct}% Positive
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider mb-0.5">
              Total Mood Logs
            </p>
            <p className="text-2xl font-black">{totalEntries}</p>
            <p className="text-[11px] text-indigo-100/80 font-medium mt-0.5">Days recorded</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider mb-0.5">
              Most Frequent
            </p>
            <p className="text-xl font-black flex items-center gap-1.5 truncate">
              <span>{moodCounts[mostFrequentMood]?.emoji || '😊'}</span>
              <span>{mostFrequentMood}</span>
            </p>
            <p className="text-[11px] text-indigo-100/80 font-medium mt-0.5">Primary emotion</p>
          </div>
        </div>
      </div>

      {/* Section 1: Mood Distribution */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Mood Distribution Breakdown
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-400">{totalEntries} Entries</span>
        </div>

        <div className="space-y-3">
          {Object.entries(moodCounts).map(([label, info]) => {
            const pct = totalEntries > 0 ? Math.round((info.count / totalEntries) * 100) : 0;
            return (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <span>{info.emoji}</span>
                    <span>{label}</span>
                  </span>
                  <span className="text-gray-400">
                    {info.count} days ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      label === 'Awesome' && 'bg-emerald-500',
                      label === 'Good' && 'bg-blue-500',
                      label === 'Okay' && 'bg-indigo-500',
                      label === 'Sad' && 'bg-amber-500',
                      label === 'Stressed' && 'bg-red-500',
                    )}
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Top Mood Tags */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Frequent Mood Triggers & Tags
            </h2>
          </div>
        </div>

        {Object.keys(tagCounts).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(tagCounts).map(([tag, count]) => (
              <span
                key={tag}
                className="px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 text-xs font-bold flex items-center gap-1.5"
              >
                <span>#{tag}</span>
                <span className="bg-indigo-200 dark:bg-indigo-900 px-1.5 py-0.5 rounded-full text-[10px] text-indigo-800 dark:text-indigo-200 font-extrabold">
                  {count}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-bold text-center py-4">
            Add tags (e.g. #Work, #Workout, #Family) when logging moods to see trigger analytics here!
          </p>
        )}
      </div>
    </div>
  );
}
