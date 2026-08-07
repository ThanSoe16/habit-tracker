'use client';

import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from 'date-fns';
import { useMoodStore } from '@/store/use-mood-store';
import { cn } from '@/utils/cn';
import { Plus, Smile } from 'lucide-react';
import { isBefore, startOfDay } from 'date-fns';

interface MoodCalendarProps {
  currentDate: Date;
  onDayClick: (date: Date) => void;
}

const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export function MoodCalendar({ currentDate, onDayClick }: MoodCalendarProps) {
  const { history } = useMoodStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  // Start from Monday (ISO)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  return (
    <div className="px-2 sm:px-4 pb-20">
      <div className="grid grid-cols-7 mb-4">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-black text-gray-400 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-x-1 gap-y-5 sm:gap-y-6">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const moodEntry = history[dateKey];
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isPast = isBefore(startOfDay(day), startOfDay(new Date()));

          return (
            <div
              key={dateKey}
              className={cn('flex flex-col items-center gap-1.5', !isCurrentMonth && 'opacity-20')}
            >
              <div className="relative w-full flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0',
                    moodEntry
                      ? 'bg-transparent scale-105'
                      : isToday(day)
                        ? 'bg-blue-500/10 border-2 border-blue-500 text-blue-600'
                        : isPast
                          ? 'border-2 border-dashed border-gray-300 dark:border-zinc-700'
                          : 'border-2 border-gray-200 dark:border-zinc-800',
                  )}
                  onClick={() => onDayClick(day)}
                >
                  {moodEntry ? (
                    <span className="text-2xl sm:text-3xl drop-shadow-xs">{moodEntry.emoji}</span>
                  ) : isToday(day) ? (
                    <Plus className="w-5 h-5 text-blue-600" />
                  ) : isPast ? (
                    <Smile className="w-4 h-4 text-gray-300 dark:text-zinc-600" />
                  ) : (
                    <Smile className="w-4 h-4 text-gray-200 dark:text-zinc-700 opacity-40" />
                  )}
                </div>

                <div className="flex flex-col items-center gap-0.5 mt-1.5 min-h-[22px]">
                  <span
                    className={cn(
                      'text-xs font-extrabold tabular-nums tracking-tight',
                      isToday(day) ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-gray-900 dark:text-white',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {moodEntry && (
                    <span className="text-[9px] text-gray-400 font-extrabold truncate max-w-full px-0.5 leading-none">
                      {moodEntry.tag || moodEntry.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
