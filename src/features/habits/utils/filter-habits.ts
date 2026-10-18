import type { Habit } from '../types';
import { isHabitRequiredOnDate } from '@/utils/date-utils';

export type HabitListFilter = {
  date: string;
  status: 'all' | 'pending' | 'completed';
  hideCompleted: boolean;
  sortBy: string;
};
export function filterHabits(habits: Habit[], filters: HabitListFilter) {
  const date = new Date(`${filters.date}T12:00:00`);
  const completed = (habit: Habit) => {
    const entry = habit.history[filters.date];
    return typeof entry === 'boolean' ? entry : Boolean(entry?.completed);
  };
  return habits
    .filter((habit) => {
      if (
        (habit.startDate && filters.date < habit.startDate) ||
        (habit.endDate && filters.date > habit.endDate)
      )
        return false;
      if (!isHabitRequiredOnDate(habit, date)) return false;
      const done = completed(habit);
      return (
        !(filters.hideCompleted && done) &&
        (filters.status === 'all' || (filters.status === 'completed' ? done : !done))
      );
    })
    .sort((a, b) => {
      if (filters.sortBy === 'alphabetical')
        return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
      if (filters.sortBy === 'streak') return b.streak - a.streak || a.id.localeCompare(b.id);
      if (filters.sortBy === 'timeOfDay') {
        const order = { morning: 1, afternoon: 2, evening: 3 };
        const difference = order[a.timeOfDay ?? 'morning'] - order[b.timeOfDay ?? 'morning'];
        if (difference) return difference;
      }
      return (
        Number(completed(a)) - Number(completed(b)) ||
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        a.id.localeCompare(b.id)
      );
    });
}
