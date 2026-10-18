import type { Habit } from '../types';
import { getLocalDateString, isHabitRequiredOnDate } from '@/utils/date-utils';

export const calculateStreak = (habit: Habit, history: Habit['history']): number => {
  let streak = 0;
  const todayStr = getLocalDateString();
  const currentDate = new Date();

  while (true) {
    const dateStr = getLocalDateString(currentDate);
    const entry = history[dateStr];
    const isDone = typeof entry === 'boolean' ? entry : entry?.completed;
    const isRequired = isHabitRequiredOnDate(habit, currentDate);

    if (isRequired) {
      if (isDone) {
        streak++;
      } else {
        if (dateStr === todayStr) {
          // Keep going to check yesterday
        } else {
          break;
        }
      }
    }

    currentDate.setDate(currentDate.getDate() - 1);
    if (streak > 366) break;
    if (currentDate.getFullYear() < 2024) break;
  }

  return streak;
};
