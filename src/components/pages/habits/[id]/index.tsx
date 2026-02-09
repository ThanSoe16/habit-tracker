"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useHabitStore } from "@/store/useHabitStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { Progress } from "@/components/ui/progress";
// Assuming we have a Calendar component or we'll build a simplified one for stats
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";

export default function HabitDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { habits, removeHabit } = useHabitStore();
  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Habit not found</p>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this habit?")) {
      removeHabit(habit.id);
      router.back();
    }
  };

  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Habit</h1>
        <div className="flex gap-1">
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Pencil className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={handleDelete}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </header>

      <div className="px-6 py-4 space-y-6">
        {/* Habit Info */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
            style={{ backgroundColor: habit.color + "20" }}
          >
            {habit.emoji || "✨"}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{habit.name}</h2>
            <p className="text-gray-500 font-medium">Everyday</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5">
            <p className="text-[17px] font-bold text-gray-800">
              {habit.streak} days
            </p>
            <p className="text-[13px] text-gray-400 font-medium mt-1">
              Current streak
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5">
            <p className="text-[17px] font-bold text-gray-800">95%</p>
            <p className="text-[13px] text-gray-400 font-medium mt-1">
              Completion rate
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5">
            <p className="text-[17px] font-bold text-gray-800">459</p>
            <p className="text-[13px] text-gray-400 font-medium mt-1">
              Habits completed
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5">
            <p className="text-[17px] font-bold text-gray-800">386</p>
            <p className="text-[13px] text-gray-400 font-medium mt-1">
              Total perfect days
            </p>
          </div>
        </div>

        {/* Calendar Stats */}
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Calendar Stats</h3>
            <div className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
              This Month
            </div>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-[15px] font-bold text-gray-800 mb-6">
              {format(currentDate, "MMMM yyyy")}
            </p>

            <div className="w-full grid grid-cols-7 gap-y-4">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-bold text-gray-400"
                >
                  {d}
                </div>
              ))}
              {days.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const isDone = habit.history[dateKey];
                return (
                  <div
                    key={dateKey}
                    className="flex items-center justify-center"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        isDone
                          ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                          : "text-gray-400",
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
