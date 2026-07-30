'use client';

import { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { HabitCard } from './HabitCard';
import { HabitCompletionDrawer } from './HabitCompletionDrawer';
import { isHabitRequiredOnDate } from '@/utils/dateUtils';

interface HabitListProps {
  selectedDate?: Date;
  filter?: 'all' | 'pending' | 'completed';
}

export function HabitList({ selectedDate = new Date(), filter = 'all' }: HabitListProps) {
  const { habits, toggleHabit, removeCompletion, isLoaded } = useHabitStore();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  // Get fresh habit data from store (not stale copy)
  const selectedHabit = selectedHabitId
    ? habits.find((h) => h.id === selectedHabitId) || null
    : null;

  if (!isLoaded) {
    return <div className="p-8 text-center text-muted-foreground">Loading habits...</div>;
  }

  // Filter habits based on selected date
  const filteredHabits = habits.filter((habit) => {
    // 1. Date Range Check
    const selectedDateStr = selectedDate.toLocaleDateString('en-CA');

    if (habit.startDate) {
      if (selectedDateStr < habit.startDate) return false;
    }

    if (habit.endDate) {
      if (selectedDateStr > habit.endDate) return false;
    }

    // 2. Repeat Logic Check
    return isHabitRequiredOnDate(habit as any, selectedDate);
  });

  // Sort: incomplete habits first (original order), completed habits last
  const dateString = selectedDate.toLocaleDateString('en-CA');

  // Apply filter
  const finalFilteredHabits = filteredHabits.filter((habit) => {
    const entry = habit.history[dateString];
    const isDone = typeof entry === 'boolean' ? entry : !!entry?.completed;
    if (filter === 'pending') return !isDone;
    if (filter === 'completed') return isDone;
    return true; // 'all'
  });

  const sortedHabits = [...finalFilteredHabits].sort((a, b) => {
    const aEntry = a.history[dateString];
    const bEntry = b.history[dateString];
    const aDone = typeof aEntry === 'boolean' ? aEntry : !!aEntry?.completed;
    const bDone = typeof bEntry === 'boolean' ? bEntry : !!bEntry?.completed;

    if (aDone === bDone) return 0; // preserve original order
    return aDone ? 1 : -1; // completed → bottom
  });

  if (sortedHabits.length === 0) {
    return (
      <div className="text-center p-10 mt-4 bg-white rounded-[2rem] border border-dashed">
        <p className="text-muted-foreground">No habits for this day.</p>
      </div>
    );
  }

  const handleQuickAdd = (habit: any) => {
    const dateStr = selectedDate.toLocaleDateString('en-CA');
    const entry = habit.history[dateStr];

    if (habit.unitType === 'count') {
      const current = typeof entry === 'object' ? parseInt(entry.count || '0', 10) : 0;
      const next = current + 1;
      const isDone = next >= (habit.goalValue || 1);
      toggleHabit(habit.id, dateStr, {
        completed: isDone,
        count: String(next),
        timeTaken: typeof entry === 'object' ? entry.timeTaken : undefined,
        notes: typeof entry === 'object' ? entry.notes : undefined,
      });
    } else if (habit.unitType === 'time') {
      const current = typeof entry === 'object' ? parseInt(entry.timeTaken || '0', 10) : 0;
      const next = current + 5; // increment by 5 mins
      const isDone = next >= (habit.goalValue || 1);
      toggleHabit(habit.id, dateStr, {
        completed: isDone,
        timeTaken: String(next),
        count: typeof entry === 'object' ? entry.count : undefined,
        notes: typeof entry === 'object' ? entry.notes : undefined,
      });
    }
  };

  const handleQuickComplete = (habit: any) => {
    const dateStr = selectedDate.toLocaleDateString('en-CA');
    toggleHabit(habit.id, dateStr, {
      completed: true,
      count: habit.unitType === 'count' ? String(habit.goalValue || 1) : undefined,
      timeTaken: habit.unitType === 'time' ? String(habit.goalValue || 1) : undefined,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 no-scrollbar">
        {sortedHabits.map((habit, index) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            date={selectedDate}
            isLast={index === sortedHabits.length - 1}
            onClick={() => setSelectedHabitId(habit.id)}
            onQuickAdd={() => handleQuickAdd(habit)}
            onQuickComplete={() => handleQuickComplete(habit)}
          />
        ))}
      </div>

      {selectedHabit && (
        <HabitCompletionDrawer
          habit={selectedHabit}
          date={selectedDate}
          isOpen={!!selectedHabit}
          onClose={() => setSelectedHabitId(null)}
          onSave={toggleHabit}
          onRemove={removeCompletion}
        />
      )}
    </>
  );
}
