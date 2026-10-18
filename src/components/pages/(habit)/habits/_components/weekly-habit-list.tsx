'use client';

import React, { useMemo } from 'react';
import { useHabitList } from '@/features/habits/services/list-queries';
import { InfiniteListEnd } from '@/components/shared/infinite-list';
import { WeeklyHabitCard } from './weekly-habit-card';
import { startOfWeek, addDays } from 'date-fns';

export function WeeklyHabitList() {
  const query = useHabitList();
  const { habits, isLoaded } = query;

  const displayedHabits = useMemo(() => {
    return habits;
  }, [habits]);

  const weekDates = useMemo(() => {
    // startOfWeek(date, { weekStartsOn: 1 }) sets Monday as the first day of the week
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
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
        <WeeklyHabitCard key={habit.id} habit={habit} weekDates={weekDates} />
      ))}
      <InfiniteListEnd query={query} />
    </div>
  );
}
