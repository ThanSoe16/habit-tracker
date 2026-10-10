import { habitCompletionRemarksSchema, type Habit } from '../types';
import { formatTimeTakenDisplay } from '@/utils/time-utils';

export function createHabitCompletion(habit: Habit, date: string, notes: string) {
  const remarks = habitCompletionRemarksSchema.parse({ notes });
  const entry = habit.history[date];
  const previous = typeof entry === 'object' ? entry : undefined;
  const isTimed = habit.unitType === 'time' || habit.unitType === 'duration';
  const goalSeconds =
    (habit.goalValue || 10) * (habit.timeUnit === 'hr' ? 3600 : habit.timeUnit === 'sec' ? 1 : 60);

  return {
    ...previous,
    ...(isTimed ? { timeTaken: previous?.timeTaken || formatTimeTakenDisplay(goalSeconds) } : {}),
    ...(habit.unitType === 'count'
      ? { count: previous?.count || String(habit.goalValue || 1) }
      : {}),
    completed: true,
    notes: remarks.notes,
  };
}
