"use client";

import { useHabitStore } from "@/store/useHabitStore";
import { Target, Flame, CheckCircle2 } from "lucide-react";

export function QuickStats() {
  const { habits } = useHabitStore();

  const totalHabits = habits.length;

  const currentStreak =
    habits.length > 0 ? Math.max(0, ...habits.map((h) => h.streak)) : 0;

  const totalCompletions = habits.reduce((acc, h) => {
    return (
      acc +
      Object.values(h.history).filter((entry) => {
        return typeof entry === "boolean" ? entry : entry?.completed;
      }).length
    );
  }, 0);

  const stats = [
    {
      icon: Target,
      value: totalHabits,
      label: "Total Habits",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      icon: Flame,
      value: `${currentStreak}d`,
      label: "Best Streak",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      icon: CheckCircle2,
      value: totalCompletions,
      label: "Completed",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2"
        >
          <div
            className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <p className="text-lg font-bold text-foreground">{stat.value}</p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
