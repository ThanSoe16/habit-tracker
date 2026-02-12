"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { Habit } from "@/store/useHabitStore";
import { getLocalDateString } from "@/utils/dateUtils";

interface OverallHabitCardProps {
  habit: Habit;
  gridDates: Date[][]; // [weekIndex][dayIndex]
  currentMonth: number;
  currentYear: number;
}

export function OverallHabitCard({
  habit,
  gridDates,
  currentMonth,
  currentYear,
}: OverallHabitCardProps) {
  const getFrequencyText = () => {
    if (
      habit.frequency === "daily" ||
      (habit.repeatDays && habit.repeatDays.length === 7)
    ) {
      return "Everyday";
    }
    if (habit.frequency === "specific") {
      return "Specific days";
    }
    if (habit.repeatDays && habit.repeatDays.length > 0) {
      return `${habit.repeatDays.length} days per week`;
    }
    return "Once";
  };

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">{habit.emoji || "🎯"}</span>
          <h3 className="font-bold text-gray-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
            {habit.name}
          </h3>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">
          {getFrequencyText()}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-x-0 gap-y-[6px] px-2">
        {/* Day Labels - Top Row */}
        {dayLabels.map((label, i) => (
          <span
            key={label + i}
            className="text-[9px] text-gray-400 font-bold w-full flex justify-center mb-1"
          >
            {label}
          </span>
        ))}

        {/* The Grid: All dates in the month-weeks range */}
        {gridDates.flat().map((date) => {
          const dateStr = getLocalDateString(date);
          const historyEntry = habit.history[dateStr];
          const isCompleted =
            typeof historyEntry === "boolean"
              ? historyEntry
              : historyEntry?.completed;

          const isCurrentMonth =
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear;

          return (
            <div key={dateStr} className="flex justify-center">
              <div
                className={cn(
                  "w-[12px] h-[12px] rounded-full transition-colors",
                  !isCurrentMonth
                    ? "opacity-0"
                    : isCompleted
                      ? ""
                      : "bg-gray-100",
                )}
                style={
                  isCurrentMonth && isCompleted
                    ? { backgroundColor: habit.color }
                    : {}
                }
                title={dateStr}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
