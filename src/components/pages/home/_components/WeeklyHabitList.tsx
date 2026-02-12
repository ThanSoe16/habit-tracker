"use client";

import React, { useMemo } from "react";
import { useHabitStore } from "@/store/useHabitStore";
import { WeeklyHabitCard } from "./WeeklyHabitCard";
import { startOfWeek, addDays } from "date-fns";

export function WeeklyHabitList({ limit }: { limit?: number }) {
  const { habits, isLoaded } = useHabitStore();

  const displayedHabits = useMemo(() => {
    return limit ? habits.slice(0, limit) : habits;
  }, [habits, limit]);

  const weekDates = useMemo(() => {
    // startOfWeek(date, { weekStartsOn: 1 }) sets Monday as the first day of the week
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, []);

  if (!isLoaded) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading habits...
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center p-10 mt-4 bg-white rounded-[2rem] border border-dashed box-border">
        <p className="text-muted-foreground">No habits created yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {displayedHabits.map((habit) => (
        <WeeklyHabitCard key={habit.id} habit={habit} weekDates={weekDates} />
      ))}
    </div>
  );
}
