'use client';

import React from 'react';
import { useMoodStore } from '@/store/use-mood-store';
import { Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';

export default function MoodHistoryPageComponent() {
  const router = useRouter();
  const { history } = useMoodStore();

  // Convert history entries to a sorted array (descending)
  const entries = Object.entries(history)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .map(([date, entry]) => ({ date, ...entry }));

  return (
    <div className="space-y-5">
      {/* Entries List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" /> Logged Mood Entries ({entries.length})
          </h2>
        </div>

        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.date}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50 flex items-center gap-4 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-3xl shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                  {entry.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                      {entry.label}
                    </h3>
                    {entry.tag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                        {entry.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    {format(parseISO(entry.timestamp), 'eeee, MMM d, yyyy • hh:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800/60 rounded-full flex items-center justify-center text-3xl border border-gray-100 dark:border-zinc-700">
              😶‍🌫️
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-extrabold text-sm">No mood history yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Start tracking how you feel each day on the Mood Calendar
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/mood/today')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/25 transition-all"
            >
              Log Your First Mood
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
