import type { Habit, HabitData } from '../types';
import { getLocalDateString } from '@/utils/date-utils';
import { normalize24HourTime } from '@/utils/time-utils';
import { calculateHabitDurationDays, calculateHabitEndDate } from '@/utils/habit-end-condition';

export function habitFormValues(habit: Habit): HabitData {
  const startDate = habit.startDate || getLocalDateString();
  const endHabitDays =
    habit.endHabitDays ||
    (habit.endHabitDate ? calculateHabitDurationDays(startDate, habit.endHabitDate) : 365);
  return {
    name: habit.name,
    color: habit.color,
    emoji: habit.emoji || '☕',
    startDate,
    type: habit.type || 'habit',
    habitKind: habit.habitKind || 'build',
    frequencyTab: habit.frequency === 'weekly' ? 'daily' : habit.frequency,
    selectedDays: habit.frequency === 'monthly' ? [] : habit.repeatDays,
    selectedMonthlyDays: habit.frequency === 'monthly' ? habit.repeatDays : [],
    selectedSpecificDates: habit.specificDates || [],
    allDay: !habit.timeOfDay,
    timeOfDay: habit.timeOfDay || 'morning',
    endHabitEnabled: !!(habit.endHabitDate || habit.endHabitDays),
    endHabitMode: habit.endHabitDate ? 'date' : 'days',
    endHabitDate: habit.endHabitDate || calculateHabitEndDate(startDate, endHabitDays),
    endHabitDays,
    reminders: !!habit.reminderTime,
    reminderTime: normalize24HourTime(habit.reminderTime),
    reminderSnoozeMinutes: habit.reminderSnoozeMinutes || 10,
    unitType: habit.unitType || 'simple',
    timerMode: habit.timerMode || 'down',
    timeUnit: habit.timeUnit || 'min',
    unit: habit.unit || (habit.unitType === 'time' ? 'Minutes' : 'Count'),
    goalValue: habit.goalValue || 1,
  };
}
