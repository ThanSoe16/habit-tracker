'use client';

import { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { HabitCard } from './HabitCard';
import { HabitCompletionDrawer } from './HabitCompletionDrawer';
import { HabitTimerModal } from './HabitTimerModal';
import { isHabitRequiredOnDate } from '@/utils/dateUtils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HabitListProps {
  selectedDate?: Date;
  filter?: 'all' | 'pending' | 'completed';
}

export function HabitList({ selectedDate = new Date(), filter = 'all' }: HabitListProps) {
  const { habits, toggleHabit, removeCompletion, isLoaded } = useHabitStore();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [timerHabitId, setTimerHabitId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Get fresh habit data from store (not stale copy)
  const selectedHabit = selectedHabitId
    ? habits.find((h) => h.id === selectedHabitId) || null
    : null;

  const timerHabit = timerHabitId ? habits.find((h) => h.id === timerHabitId) || null : null;

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

  const handleQuickSubtract = (habit: any) => {
    const dateStr = selectedDate.toLocaleDateString('en-CA');
    const entry = habit.history[dateStr];

    if (habit.unitType === 'count') {
      const current = typeof entry === 'object' ? parseInt(entry.count || '0', 10) : 0;
      const next = Math.max(0, current - 1);
      const isDone = next >= (habit.goalValue || 1);
      toggleHabit(habit.id, dateStr, {
        completed: isDone,
        count: String(next),
        timeTaken: typeof entry === 'object' ? entry.timeTaken : undefined,
        notes: typeof entry === 'object' ? entry.notes : undefined,
      });
    }
  };

  const handleQuickComplete = (habit: any) => {
    const dateStr = selectedDate.toLocaleDateString('en-CA');
    const entry = habit.history[dateStr];
    const isCurrentlyCompleted = typeof entry === 'boolean' ? entry : entry?.completed;

    if (isCurrentlyCompleted) {
      // Toggle off completion, preserving existing logged time/count
      toggleHabit(habit.id, dateStr, {
        completed: false,
      });
    } else {
      // Toggle on completion
      const prevTime = typeof entry === 'object' ? entry.timeTaken : undefined;
      const prevCount = typeof entry === 'object' ? entry.count : undefined;

      const timeVal =
        habit.unitType === 'time' || habit.unitType === 'duration'
          ? prevTime || String(habit.goalValue || 10)
          : undefined;

      const countVal = habit.unitType === 'count' ? prevCount || String(habit.goalValue || 1) : undefined;

      toggleHabit(habit.id, dateStr, {
        completed: true,
        ...(timeVal ? { timeTaken: timeVal } : {}),
        ...(countVal ? { count: countVal } : {}),
      });
    }
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const sessionsOrder: Array<{ id: string; label: string; icon: string }> = [
    { id: 'morning', label: 'Morning', icon: '☀️' },
    { id: 'afternoon', label: 'Afternoon', icon: '🌤️' },
    { id: 'evening', label: 'Evening', icon: '🌙' },
    { id: 'general', label: 'Daily Routine', icon: '📋' },
  ];

  const groupedHabits = sessionsOrder
    .map((session) => {
      const items = sortedHabits.filter((h) => {
        if (session.id === 'general') return !h.timeOfDay;
        return h.timeOfDay === session.id;
      });
      return { ...session, items };
    })
    .filter((group) => group.items.length > 0);

  return (
    <>
      <div className="space-y-4">
        {groupedHabits.map((group) => {
          const isCollapsed = collapsedGroups[group.id];
          return (
            <div
              key={group.id}
              className="bg-white/90 dark:bg-zinc-900 rounded-lg p-2 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-3"
            >
              {/* Accordion Group Header */}
              <div
                className="flex items-center justify-between cursor-pointer px-1 py-0.5"
                onClick={() => toggleGroupCollapse(group.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{group.icon}</span>
                  <h2 className="text-sm font-black text-gray-900 dark:text-white">
                    {group.label}
                  </h2>
                </div>

                <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs font-bold transition-transform">
                  {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                </div>
              </div>

              {/* Habit Cards List */}
              {!isCollapsed && (
                <div className="space-y-2.5 pt-1">
                  {group.items.map((habit, index) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      date={selectedDate}
                      isLast={index === group.items.length - 1}
                      onClick={() => {
                        if (habit.unitType === 'duration' || habit.unitType === 'time') {
                          setTimerHabitId(habit.id);
                        } else {
                          setSelectedHabitId(habit.id);
                        }
                      }}
                      onQuickAdd={() => {
                        if (habit.unitType === 'duration' || habit.unitType === 'time') {
                          setTimerHabitId(habit.id);
                        } else {
                          handleQuickAdd(habit);
                        }
                      }}
                      onQuickSubtract={() => handleQuickSubtract(habit)}
                      onQuickComplete={() => handleQuickComplete(habit)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
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

      {timerHabit && (
        <HabitTimerModal
          habit={timerHabit}
          date={selectedDate}
          isOpen={!!timerHabit}
          onClose={() => setTimerHabitId(null)}
          onSaveProgress={(id, dateStr, timeTakenStr, completed) => {
            toggleHabit(id, dateStr, {
              completed,
              timeTaken: timeTakenStr,
            });
          }}
        />
      )}
    </>
  );
}
