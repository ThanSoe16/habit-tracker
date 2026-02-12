"use client";

import { useState } from "react";
import { useHabitStore } from "@/store/useHabitStore";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  isFuture,
} from "date-fns";
import { isHabitRequiredOnDate } from "@/utils/dateUtils";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarStats() {
  const { habits } = useHabitStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getDayStatus = (day: Date): "perfect" | "partial" | "none" => {
    if (isFuture(day)) return "none";

    const dateStr = format(day, "yyyy-MM-dd");
    const requiredHabits = habits.filter((h) => {
      const createdDate = new Date(h.createdAt);
      return day >= createdDate && isHabitRequiredOnDate(h, day);
    });

    if (requiredHabits.length === 0) return "none";

    const completedCount = requiredHabits.filter((h) => {
      const entry = h.history[dateStr];
      return typeof entry === "boolean" ? entry : entry?.completed;
    }).length;

    if (completedCount === requiredHabits.length) return "perfect";
    if (completedCount > 0) return "partial";
    return "none";
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Calendar Stats</h3>
        <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-gray-100 px-3 py-1.5 rounded-full">
          This Month
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <h4 className="text-sm font-bold text-foreground">
          {format(currentDate, "MMMM yyyy")}
        </h4>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-2">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(day, monthStart);
          const status = getDayStatus(day);

          return (
            <div key={dateKey} className="flex justify-center">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  !isCurrentMonth && "opacity-20",
                  status === "perfect" && "bg-indigo-500 text-white",
                  status === "partial" && "bg-indigo-100 text-indigo-600",
                  status === "none" &&
                    isToday(day) &&
                    "border-2 border-indigo-400 text-indigo-600",
                  status === "none" && !isToday(day) && "text-gray-600",
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
