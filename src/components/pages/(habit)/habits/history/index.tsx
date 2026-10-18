'use client';

import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarDays, CheckCircle2, Clock3, ListChecks, NotebookText } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { Habit } from '@/features/habits/types';
import { useHabitReport } from '@/features/habits/services/list-queries';
import { cn } from '@/utils/cn';

type HabitHistoryItem = {
  dateKey: string;
  habit: Habit;
  completed: boolean;
  timeTaken?: string;
  count?: string;
  notes?: string;
};

function isCompleted(entry: Habit['history'][string]) {
  return typeof entry === 'boolean' ? entry : entry.completed;
}

function getHistoryDetails(entry: Habit['history'][string]) {
  if (typeof entry === 'boolean') return {};

  return {
    timeTaken: entry.timeTaken,
    count: entry.count,
    notes: entry.notes,
  };
}

function getProgressText(item: HabitHistoryItem) {
  const { habit, count, timeTaken } = item;

  if (habit.unitType === 'count' && count) {
    return `${count} / ${habit.goalValue || 1} ${habit.unit || 'times'}`;
  }

  if ((habit.unitType === 'time' || habit.unitType === 'duration') && timeTaken) {
    const unitLabel = habit.timeUnit || 'min';
    const timerLabel =
      habit.unitType === 'duration' && habit.timerMode
        ? ` (${habit.timerMode === 'down' ? 'Count Down' : 'Count Up'})`
        : '';

    return `${timeTaken} / ${habit.goalValue || 1} ${unitLabel}${timerLabel}`;
  }

  return undefined;
}

function buildHistoryItems(habits: Habit[]) {
  return habits
    .flatMap((habit) =>
      Object.entries(habit.history).map(([dateKey, entry]) => ({
        dateKey,
        habit,
        completed: isCompleted(entry),
        ...getHistoryDetails(entry),
      })),
    )
    .sort((a, b) => {
      if (a.dateKey !== b.dateKey) return b.dateKey.localeCompare(a.dateKey);
      return a.habit.name.localeCompare(b.habit.name);
    });
}

export default function HabitHistoryPage() {
  const router = useRouter();
  const { habits, isLoaded, loadError } = useHabitReport();
  const [monthFilter, setMonthFilter] = useState('all');

  const historyItems = useMemo(() => buildHistoryItems(habits), [habits]);
  const monthOptions = useMemo(
    () => Array.from(new Set(historyItems.map((item) => item.dateKey.slice(0, 7)))),
    [historyItems],
  );
  const filteredItems = useMemo(
    () =>
      monthFilter === 'all'
        ? historyItems
        : historyItems.filter((item) => item.dateKey.startsWith(monthFilter)),
    [historyItems, monthFilter],
  );
  const groupedItems = useMemo(
    () =>
      filteredItems.reduce<Record<string, HabitHistoryItem[]>>((groups, item) => {
        groups[item.dateKey] = [...(groups[item.dateKey] || []), item];
        return groups;
      }, {}),
    [filteredItems],
  );

  const completedCount = historyItems.filter((item) => item.completed).length;
  const activeDayCount = new Set(historyItems.map((item) => item.dateKey)).size;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-28">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
        <header className="flex items-center justify-between py-1">
          <SidebarTrigger className="size-10 rounded-full border border-border bg-card text-foreground shadow-xs" />

          <h1 className="text-lg font-black tracking-tight">History</h1>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 rounded-full"
            aria-label="Go to today"
            onClick={() => router.push('/habits/today')}
          >
            <CalendarDays />
          </Button>
        </header>

        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <p className="text-lg font-black">{completedCount}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Done
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <p className="text-lg font-black">{activeDayCount}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Days
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <p className="text-lg font-black">{habits.length}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Habits
            </p>
          </div>
        </section>

        {monthOptions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setMonthFilter('all')}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-xs font-black transition-colors',
                monthFilter === 'all'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              All
            </button>
            {monthOptions.map((month) => (
              <button
                key={month}
                type="button"
                onClick={() => setMonthFilter(month)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-xs font-black transition-colors',
                  monthFilter === month
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {format(parseISO(`${month}-01`), 'MMM yyyy')}
              </button>
            ))}
          </div>
        )}

        {!isLoaded ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm font-semibold text-muted-foreground">
            Loading history...
          </div>
        ) : loadError ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <p role="alert" className="text-sm font-semibold text-destructive">
              {loadError}
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <NotebookText />
            </div>
            <h2 className="mt-4 text-base font-black">No history yet</h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Complete a habit and it will appear here.
            </p>
            <Button
              type="button"
              className="mt-5 rounded-full"
              onClick={() => router.push('/habits/today')}
            >
              Go to Today
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(groupedItems).map(([dateKey, items]) => {
              const completedForDay = items.filter((item) => item.completed).length;

              return (
                <section key={dateKey} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h2 className="text-sm font-black">
                        {format(parseISO(dateKey), 'EEEE, MMM d')}
                      </h2>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {completedForDay} of {items.length} entries completed
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">
                      {format(parseISO(dateKey), 'yyyy')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {items.map((item) => {
                      const progressText = getProgressText(item);
                      const isQuitHabit = item.habit.habitKind === 'quit';

                      return (
                        <article
                          key={`${item.dateKey}-${item.habit.id}`}
                          className="rounded-3xl border border-border bg-card p-4 shadow-xs"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-lg"
                              style={{
                                backgroundColor: item.habit.color
                                  ? `${item.habit.color}22`
                                  : undefined,
                                color: item.habit.color || undefined,
                              }}
                            >
                              {item.habit.emoji || item.habit.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="truncate text-sm font-black">{item.habit.name}</h3>
                                  <p className="text-xs font-semibold text-muted-foreground">
                                    {item.habit.type === 'task'
                                      ? 'One-time task'
                                      : isQuitHabit
                                        ? 'Quit habit'
                                        : 'Regular habit'}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black',
                                    item.completed
                                      ? 'bg-primary/10 text-primary'
                                      : 'bg-muted text-muted-foreground',
                                  )}
                                >
                                  {item.completed ? <CheckCircle2 /> : <Clock3 />}
                                  {item.completed ? 'Done' : 'Logged'}
                                </span>
                              </div>

                              {(progressText || item.notes) && (
                                <div className="mt-3 flex flex-col gap-2 text-xs font-semibold text-muted-foreground">
                                  {progressText && (
                                    <p className="inline-flex items-center gap-2">
                                      <ListChecks />
                                      <span>{progressText}</span>
                                    </p>
                                  )}
                                  {item.notes && (
                                    <p className="rounded-2xl bg-muted p-3 leading-relaxed">
                                      {item.notes}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
