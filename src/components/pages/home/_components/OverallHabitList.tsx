'use client';

import React, { useMemo } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { OverallHabitCard } from './OverallHabitCard';
import { startOfMonth, endOfMonth, eachWeekOfInterval, addDays } from 'date-fns';

export function OverallHabitList({ limit }: { limit?: number }) {
  const { habits, isLoaded } = useHabitStore();

  const displayedHabits = useMemo(() => {
    return limit ? habits.slice(0, limit) : habits;
  }, [habits, limit]);

  const { gridDates, currentMonth, currentYear } = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Get the start of each week that overlaps with the current month
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

    const fullGrid: Date[][] = weeks.map((mondayOfThatWeek) => {
      return Array.from({ length: 7 }, (_, d) => addDays(mondayOfThatWeek, d));
    });

    return { gridDates: fullGrid, currentMonth, currentYear };
  }, []);

  if (!isLoaded) {
    return <div className="p-8 text-center text-muted-foreground">Loading habits...</div>;
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
        <OverallHabitCard
          key={habit.id}
          habit={habit}
          gridDates={gridDates}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      ))}
    </div>
  );
}
