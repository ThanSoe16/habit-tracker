'use client';

import React, { RefObject } from 'react';
import { useHabitStore } from '@/store/use-habit-store';
import { isHabitRequiredOnDate } from '@/utils/date-utils';
import { parseTimeTakenToSeconds } from '@/utils/time-utils';

interface CalendarStripProps {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  weekDays: Array<{
    date: Date;
    day: number;
    weekday: string;
    isToday: boolean;
    isSelected: boolean;
    id: string;
  }>;
  onSelectDate: (date: Date) => void;
}

export function CalendarStrip({ weekDays, onSelectDate, scrollContainerRef }: CalendarStripProps) {
  const { habits } = useHabitStore();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="relative py-2 px-1">
      <div
        ref={scrollContainerRef}
        className="relative flex items-center overflow-x-auto pb-1 no-scrollbar z-10 w-full"
      >
        {weekDays.map((d, i) => {
          const dateOnly = new Date(d.date);
          dateOnly.setHours(0, 0, 0, 0);
          const isPastOrToday = dateOnly <= today;
          const dateStr = d.date.toLocaleDateString('en-CA');

          // Calculate habit completion ratio for this date
          const requiredHabits = habits.filter((h) => isHabitRequiredOnDate(h, d.date));
          const totalCount = requiredHabits.length;

          let completedCount = 0;
          requiredHabits.forEach((h) => {
            const entry = h.history[dateStr];
            if (entry) {
              if (typeof entry === 'boolean') {
                if (entry) completedCount++;
              } else if (typeof entry === 'object') {
                if (entry.completed) completedCount++;
                else if (
                  h.unitType === 'count' &&
                  parseInt(entry.count || '0', 10) >= (h.goalValue || 1)
                ) {
                  completedCount++;
                } else if (
                  (h.unitType === 'time' || h.unitType === 'duration') &&
                  parseTimeTakenToSeconds(entry.timeTaken) >=
                    (h.goalValue || 1) * (h.timeUnit === 'hr' ? 3600 : 60)
                ) {
                  completedCount++;
                }
              }
            }
          });

          const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;
          const isFullyCompleted = progressRatio >= 1 && totalCount > 0;
          const isPartiallyCompleted = progressRatio > 0 && progressRatio < 1;

          return (
            <div
              key={i}
              className="flex-1 min-w-[calc(100%/7)] w-[calc(100%/7)] shrink-0 flex flex-col items-center justify-center px-0.5 py-1"
            >
              <button
                id={d.id}
                type="button"
                onClick={() => onSelectDate(d.date)}
                className={`flex flex-col items-center justify-center w-full py-1.5 px-1 rounded-2xl transition-all duration-200 ${
                  d.isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span
                  className={`text-[11px] font-extrabold tracking-tight mb-1 ${
                    d.isSelected
                      ? 'text-white/95'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {d.weekday}
                </span>

                <div className="relative w-9 h-9 flex items-center justify-center">
                  {d.isSelected ? (
                    isPartiallyCompleted ? (
                      <>
                        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            className="stroke-white/30"
                            strokeWidth="3.5"
                            fill="transparent"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            className="stroke-white transition-all duration-300"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            fill="transparent"
                            strokeDasharray="88"
                            strokeDashoffset={88 - 88 * progressRatio}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">
                          {d.day}
                        </span>
                      </>
                    ) : (
                      <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-black text-white">
                        {d.day}
                      </div>
                    )
                  ) : isPastOrToday ? (
                    isFullyCompleted ? (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                        {d.day}
                      </div>
                    ) : isPartiallyCompleted ? (
                      <>
                        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            className="stroke-blue-100 dark:stroke-zinc-800"
                            strokeWidth="3.5"
                            fill="transparent"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            className="stroke-indigo-600 transition-all duration-300"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            fill="transparent"
                            strokeDasharray="88"
                            strokeDashoffset={88 - 88 * progressRatio}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800 dark:text-gray-200">
                          {d.day}
                        </span>
                      </>
                    ) : (
                      <div className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-300 font-bold text-xs flex items-center justify-center">
                        {d.day}
                      </div>
                    )
                  ) : (
                    <div className="w-9 h-9 text-gray-400 dark:text-gray-500 text-xs font-semibold flex items-center justify-center">
                      {d.day}
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
