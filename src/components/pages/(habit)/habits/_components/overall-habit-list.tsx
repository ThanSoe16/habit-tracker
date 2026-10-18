'use client';

import React, { useMemo } from 'react';
import { useHabitList } from '@/features/habits/services/list-queries';
import { InfiniteListEnd } from '@/components/shared/infinite-list';
import { OverallHabitCard } from './overall-habit-card';
import { startOfMonth, endOfMonth, eachWeekOfInterval, addDays } from 'date-fns';

export function OverallHabitList() {
  const query = useHabitList();
  const { habits, isLoaded } = query;

  const displayedHabits = useMemo(() => {
    return habits;
  }, [habits]);

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

  if (query.isError) return <InfiniteListEnd query={query} />;

  if (!isLoaded) {
    return <div className="p-8 text-center text-muted-foreground">Loading habits...</div>;
  }

  if (habits.length === 0) {
    return (
      <div className="text-center p-10 mt-4 bg-card rounded-[2rem] border border-dashed box-border">
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
      <InfiniteListEnd query={query} />
    </div>
  );
}
