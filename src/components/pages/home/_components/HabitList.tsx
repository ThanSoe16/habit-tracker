'use client';

import { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { HabitCard } from './HabitCard';
import { HabitCompletionDrawer } from './HabitCompletionDrawer';
import { isHabitRequiredOnDate } from '@/utils/dateUtils';

interface HabitListProps {
  selectedDate?: Date;
}

export function HabitList({ selectedDate = new Date() }: HabitListProps) {
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

  if (filteredHabits.length === 0) {
    return (
      <div className="text-center p-10 mt-4 bg-white rounded-[2rem] border border-dashed">
        <p className="text-muted-foreground">No habits for this day.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2.5 no-scrollbar">
        {filteredHabits.map((habit, index) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            date={selectedDate}
            isLast={index === filteredHabits.length - 1}
            onClick={() => setSelectedHabitId(habit.id)}
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
