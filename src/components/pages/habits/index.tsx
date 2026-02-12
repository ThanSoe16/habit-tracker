"use client";

import React, { useState } from "react";
import { useHabitStore } from "@/store/useHabitStore";
import { MyHabitCard } from "./_components/MyHabitCard";
import { cn } from "@/utils/cn";
import { Plus, MoreVertical, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyHabitsPage() {
  const router = useRouter();
  const { habits } = useHabitStore();
  const [activeTab, setActiveTab] = useState<"habit" | "task">("habit");

  const filteredHabits = habits.filter((h) => {
    const type = h.type || "habit";
    return type === activeTab;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">My Habits</h1>
      </header>

      {/* Segmented Control */}
      <div className="px-6 py-2">
        <div className="bg-gray-100 p-1.5 rounded-2xl flex">
          <button
            onClick={() => setActiveTab("habit")}
            className={cn(
              "flex-1 py-3 text-[15px] font-bold rounded-xl transition-all",
              activeTab === "habit"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            Regular Habit
          </button>
          <button
            onClick={() => setActiveTab("task")}
            className={cn(
              "flex-1 py-3 text-[15px] font-bold rounded-xl transition-all",
              activeTab === "task"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            One-Time Task
          </button>
        </div>
      </div>

      {/* Habit List */}
      <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto no-scrollbar pb-32">
        {filteredHabits.length > 0 ? (
          filteredHabits.map((habit) => (
            <MyHabitCard
              key={habit.id}
              habit={habit}
              onClick={() => router.push(`/habits/${habit.id}`)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
              🍃
            </div>
            <div>
              <p className="text-gray-500 font-bold">No {activeTab}s yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Start by adding a new one!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {/* 
        NOTE: This is just a placeholder, 
        actual implementation might need to open AddHabitDialog 
      */}
      <div className="fixed bottom-32 right-6">
        <button
          onClick={() => router.push("/habits/create")}
          className="w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center border-none transition-all active:scale-95 hover:scale-105"
        >
          <Plus className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}
