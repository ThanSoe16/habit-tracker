'use client';

import { useHabitStore } from '@/store/useHabitStore';
import { isHabitRequiredOnDate, getLocalDateString } from '@/utils/dateUtils';

export function StatsCards() {
  const { habits } = useHabitStore();

  // Current streak: max streak across all habits
  const currentStreak = habits.length > 0 ? Math.max(0, ...habits.map((h) => h.streak)) : 0;

  // Total habits completed across all time
  const totalCompleted = habits.reduce((acc, h) => {
    return (
      acc +
      Object.values(h.history).filter((entry) => {
        return typeof entry === 'boolean' ? entry : entry?.completed;
      }).length
    );
  }, 0);

  // Completion rate: completed / required across all habits and all dates
  const { completed: totalDone, required: totalRequired } = habits.reduce(
    (acc, habit) => {
      const createdDate = new Date(habit.createdAt);
      const today = new Date();
      const current = new Date(createdDate);
      let required = 0;
      let completed = 0;

      while (current <= today) {
        if (isHabitRequiredOnDate(habit, current)) {
          required++;
          const dateStr = getLocalDateString(current);
          const entry = habit.history[dateStr];
          const isDone = typeof entry === 'boolean' ? entry : entry?.completed;
          if (isDone) completed++;
        }
        current.setDate(current.getDate() + 1);
      }

      return {
        completed: acc.completed + completed,
        required: acc.required + required,
      };
    },
    { completed: 0, required: 0 },
  );

  const completionRate = totalRequired > 0 ? Math.round((totalDone / totalRequired) * 100) : 0;

  // Total perfect days: days where ALL required habits were completed
  const perfectDays = (() => {
    if (habits.length === 0) return 0;

    // Gather all unique dates from all habit histories
    const allDates = new Set<string>();
    habits.forEach((h) => {
      Object.keys(h.history).forEach((d) => allDates.add(d));
    });

    let count = 0;
    allDates.forEach((dateStr) => {
      const date = new Date(dateStr + 'T12:00:00');
      const requiredHabits = habits.filter((h) => isHabitRequiredOnDate(h, date));
      if (requiredHabits.length === 0) return;

      const allDone = requiredHabits.every((h) => {
        const entry = h.history[dateStr];
        return typeof entry === 'boolean' ? entry : entry?.completed;
      });
      if (allDone) count++;
    });

    return count;
  })();

  const stats = [
    {
      value: `${currentStreak}`,
      suffix: currentStreak === 1 ? ' day' : ' days',
      label: 'Current streak',
    },
    {
      value: `${completionRate}`,
      suffix: '%',
      label: 'Completion rate',
    },
    {
      value: totalCompleted.toLocaleString(),
      suffix: '',
      label: 'Habits completed',
    },
    {
      value: `${perfectDays}`,
      suffix: '',
      label: 'Total perfect days',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-foreground">
            {stat.value}
            <span className="text-lg">{stat.suffix}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
