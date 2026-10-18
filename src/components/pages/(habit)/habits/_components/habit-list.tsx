'use client';

import { useState } from 'react';
import type { Habit } from '@/features/habits/types';
import { useTodayHabits } from '@/features/habits/services/list-queries';
import { useHabitActions } from '@/features/habits/services/actions';
import { InfiniteListEnd } from '@/components/shared/infinite-list';
import { useUserStore } from '@/store/use-user-store';
import { HabitCard } from './habit-card';
import { HabitCompletionDrawer } from './habit-completion-drawer';
import { HabitCompleteSheet } from './habit-complete-sheet';
import { HabitTimerModal } from './habit-timer-modal';
import { parseTimeTakenToSeconds, formatTimeTakenDisplay } from '@/utils/time-utils';
import { parseHabitCount } from '@/features/habits/utils/progress';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HabitListProps {
  selectedDate?: Date;
  filter?: 'all' | 'pending' | 'completed';
}

export function HabitList({ selectedDate = new Date(), filter = 'all' }: HabitListProps) {
  const homeSettings = useUserStore((state) => state.homeSettings);
  const query = useTodayHabits({
    date: selectedDate.toLocaleDateString('en-CA'),
    status: filter,
    hideCompleted: homeSettings.hideCompleted,
    sortBy: homeSettings.sortBy,
  });
  const { habits, isLoaded } = query;
  const { toggleHabit, removeCompletion } = useHabitActions();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [timerHabitId, setTimerHabitId] = useState<string | null>(null);
  const [completionHabitId, setCompletionHabitId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const selectedHabit = selectedHabitId
    ? habits.find((h) => h.id === selectedHabitId) || null
    : null;

  const timerHabit = timerHabitId ? habits.find((h) => h.id === timerHabitId) || null : null;
  const completionHabit = habits.find((habit) => habit.id === completionHabitId);

  if (query.isError && !habits.length) return <InfiniteListEnd query={query} />;

  if (!isLoaded) {
    return <div className="p-8 text-center text-muted-foreground">Loading habits...</div>;
  }

  const dateString = selectedDate.toLocaleDateString('en-CA');
  const sortedHabits = habits;

  if (sortedHabits.length === 0) {
    return (
      <div className="text-center p-10 mt-4 bg-white dark:bg-zinc-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-zinc-800">
        <p className="text-muted-foreground text-sm font-semibold">
          {query.hasNextPage ? 'Loading habits...' : 'No habits for this day.'}
        </p>
        <InfiniteListEnd query={query} />
      </div>
    );
  }

  const handleQuickAdd = (habit: Habit) => {
    const dateStr = selectedDate.toLocaleDateString('en-CA');
    const entry = habit.history[dateStr];

    if (habit.unitType === 'count') {
      const current = typeof entry === 'object' ? parseHabitCount(entry.count) : 0;
      const next = current + 1;
      const isDone = next >= (habit.goalValue || 1);
      toggleHabit(habit.id, dateStr, {
        completed: isDone,
        count: String(next),
        timeTaken: typeof entry === 'object' ? entry.timeTaken : undefined,
        notes: typeof entry === 'object' ? entry.notes : undefined,
      });
    } else if (habit.unitType === 'time') {
      const currentSecs = typeof entry === 'object' ? parseTimeTakenToSeconds(entry?.timeTaken) : 0;
      const nextSecs = currentSecs + 5 * 60;
      const isGoalInHours = habit.timeUnit === 'hr';
      const goalSecs = (habit.goalValue || 1) * (isGoalInHours ? 3600 : 60);
      const isDone = nextSecs >= goalSecs;
      toggleHabit(habit.id, dateStr, {
        completed: isDone,
        timeTaken: formatTimeTakenDisplay(nextSecs),
        count: typeof entry === 'object' ? entry.count : undefined,
        notes: typeof entry === 'object' ? entry.notes : undefined,
      });
    }
  };

  const handleQuickSubtract = (habit: Habit) => {
    const dateStr = selectedDate.toLocaleDateString('en-CA');
    const entry = habit.history[dateStr];

    if (habit.unitType === 'count') {
      const current = typeof entry === 'object' ? parseHabitCount(entry.count) : 0;
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

  const handleQuickComplete = (habit: Habit) => {
    const dateStr = selectedDate.toLocaleDateString('en-CA');
    const entry = habit.history[dateStr];
    const isCurrentlyCompleted = typeof entry === 'boolean' ? entry : entry?.completed;

    if (isCurrentlyCompleted) {
      toggleHabit(habit.id, dateStr, { completed: false });
    } else {
      setCompletionHabitId(habit.id);
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

  const renderHabitCard = (habit: Habit, index: number, total: number) => (
    <HabitCard
      key={habit.id}
      habit={habit}
      date={selectedDate}
      isLast={index === total - 1}
      cardStyle={homeSettings.cardStyle}
      showStreakBadges={homeSettings.showStreakBadges}
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
  );

  return (
    <>
      <div className="space-y-3">
        {homeSettings.groupByTimeOfDay ? (
          groupedHabits.map((group) => {
            const isCollapsed = collapsedGroups[group.id];
            return (
              <div
                key={group.id}
                className="bg-white/90 dark:bg-zinc-900 rounded-2xl p-2.5 shadow-xs border border-gray-100 dark:border-zinc-800 space-y-2.5"
              >
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
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="space-y-2.5 pt-0.5">
                    {group.items.map((habit, index) =>
                      renderHabitCard(habit, index, group.items.length),
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="space-y-2.5">
            {sortedHabits.map((habit, index) => renderHabitCard(habit, index, sortedHabits.length))}
          </div>
        )}
      </div>

      <InfiniteListEnd query={query} />

      {completionHabit && (
        <HabitCompleteSheet
          key={`${completionHabit.id}-${dateString}`}
          habit={completionHabit}
          dateString={dateString}
          onClose={() => setCompletionHabitId(null)}
        />
      )}

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
