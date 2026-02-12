"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { Habit } from "@/store/useHabitStore";
import { getLocalDateString } from "@/utils/dateUtils";

interface WeeklyHabitCardProps {
  habit: Habit;
  weekDates: Date[];
}

export function WeeklyHabitCard({ habit, weekDates }: WeeklyHabitCardProps) {
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

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">{habit.emoji || "🎯"}</span>
          <h3 className="font-bold text-gray-800">{habit.name}</h3>
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {getFrequencyText()}
        </span>
      </div>

      <div className="flex justify-between items-center">
        {weekDates.map((date, index) => {
          const dateStr = getLocalDateString(date);
          const historyEntry = habit.history[dateStr];
          const isCompleted =
            typeof historyEntry === "boolean"
              ? historyEntry
              : historyEntry?.completed;
          const isToday = getLocalDateString() === dateStr;

          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-bold",
                  isToday ? "text-indigo-500" : "text-gray-400",
                )}
              >
                {dayNames[index]}
              </span>
              <div
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                  isCompleted
                    ? "border-transparent text-white shadow-sm"
                    : "border-gray-100 text-transparent bg-gray-50/50",
                )}
                style={isCompleted ? { backgroundColor: habit.color } : {}}
              >
                <Check className="w-4 h-4" strokeWidth={3} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
