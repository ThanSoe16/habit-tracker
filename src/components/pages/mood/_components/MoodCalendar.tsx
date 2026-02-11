"use client";

import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import { useMoodStore } from "@/store/useMoodStore";
import { cn } from "@/utils/cn";
import { Plus, Smile } from "lucide-react";

interface MoodCalendarProps {
  currentDate: Date;
  onDayClick: (date: Date) => void;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

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
      <div className="grid grid-cols-7 mb-4">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-bold text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-6">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const moodEntry = history[dateKey];
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={dateKey}
              className={cn(
                "flex flex-col items-center gap-1 min-h-[80px]",
                !isCurrentMonth && "opacity-20",
              )}
            >
              <div className="relative w-full flex flex-col items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      moodEntry
                        ? "bg-transparent scale-110"
                        : "bg-gray-50 border border-gray-100",
                    )}
                    onClick={() => onDayClick(day)}
                  >
                    {moodEntry ? (
                      <span className="text-3xl drop-shadow-sm cursor-pointer">
                        {moodEntry.emoji}
                      </span>
                    ) : isToday(day) ? (
                      <Plus className="w-6 h-6 text-indigo-400" />
                    ) : (
                      <Smile className="w-6 h-6 text-gray-200" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold tracking-tight",
                      moodEntry ? "text-gray-500" : "text-gray-400",
                    )}
                  >
                    {moodEntry ? moodEntry.tag || moodEntry.label : "Mood"}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 font-bold",
                    isToday(day) ? "text-primary" : "text-gray-400",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
