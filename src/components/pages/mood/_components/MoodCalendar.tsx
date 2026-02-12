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
import { useMoodStore } from '@/store/useMoodStore';
import { cn } from '@/utils/cn';
import { Plus, Smile } from 'lucide-react';

interface MoodCalendarProps {
  currentDate: Date;
  onDayClick: (date: Date) => void;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

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
    <div className="px-4 pb-20">
      <div className="grid grid-cols-7 mb-6">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-6">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const moodEntry = history[dateKey];
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={dateKey}
              className={cn('flex flex-col items-center gap-2', !isCurrentMonth && 'opacity-20')}
            >
              <div className="relative w-full flex flex-col items-center">
                <div
                  className={cn(
                    'w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all',
                    moodEntry ? 'bg-transparent scale-110' : 'bg-white border-2 border-gray-100',
                  )}
                  onClick={() => onDayClick(day)}
                >
                  {moodEntry ? (
                    <span className="text-3xl md:text-4xl drop-shadow-sm cursor-pointer">
                      {moodEntry.emoji}
                    </span>
                  ) : isToday(day) ? (
                    <Plus className="w-6 h-6 text-indigo-400" />
                  ) : (
                    <Smile className="w-6 h-6 text-gray-200" />
                  )}
                </div>
                <div className="flex flex-col items-center gap-0.5 mt-2">
                  <span
                    className={cn(
                      'text-xs md:text-sm font-bold',
                      isToday(day) ? 'text-indigo-600' : 'text-gray-900',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {moodEntry && (
                    <span className="text-[10px] md:text-xs text-gray-500 font-medium truncate max-w-full px-1">
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
