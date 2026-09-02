'use client';
import { useForm } from 'react-hook-form';
import { HabitData, habitSchema } from '@/features/habits/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHabitStore, Habit } from '@/store/use-habit-store';
import { useRouter } from 'next/navigation';
import HabitForm from '../../../_components/form/habit-form';
import { normalize24HourTime } from '@/utils/time-utils';
import { calculateHabitDurationDays, calculateHabitEndDate } from '@/utils/habit-end-condition';
import { getLocalDateString } from '@/utils/date-utils';

const HabitEditForm = ({ habit }: { habit: Habit }) => {
  const router = useRouter();
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const startDate = habit.startDate || getLocalDateString();
  const endHabitDays =
    habit.endHabitDays ||
    (habit.endHabitDate ? calculateHabitDurationDays(startDate, habit.endHabitDate) : 365);
  const endHabitDate = habit.endHabitDate || calculateHabitEndDate(startDate, endHabitDays);

  const form = useForm<HabitData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit.name,
      color: habit.color || '#2563eb',
      emoji: habit.emoji || '☕',
      startDate,
      type: habit.type || 'habit',
      frequencyTab: (habit.frequency as any) || 'weekly',
      selectedDays: habit.repeatDays || [1, 2, 3, 4, 5, 6, 0],
      selectedMonthlyDays: habit.frequency === 'monthly' ? habit.repeatDays : [],
      selectedSpecificDates: habit.specificDates || [],
      allDay: !habit.timeOfDay,
      timeOfDay: habit.timeOfDay || 'morning',
      endHabitEnabled: !!(habit.endHabitDate || habit.endHabitDays),
      endHabitMode: habit.endHabitDate ? 'date' : 'days',
      endHabitDate,
      endHabitDays,
      reminders: !!habit.reminderTime,
      reminderTime: normalize24HourTime(habit.reminderTime),
      unitType: habit.unitType || 'simple',
      timerMode: habit.timerMode || 'down',
      timeUnit: habit.timeUnit || 'min',
      unit: habit.unit || (habit.unitType === 'time' ? 'Minutes' : 'Count'),
      goalValue: habit.goalValue || 1,
    },
  });

  const onSubmit = async (data: HabitData) => {
    await updateHabit(habit.id, {
      name: data.name,
      color: data.color,
      frequency: data.frequencyTab as any,
      repeatDays:
        data.frequencyTab === 'daily'
          ? data.selectedDays
          : data.frequencyTab === 'monthly'
            ? data.selectedMonthlyDays
            : [],
      emoji: data.emoji,
      startDate: data.startDate,
      type: data.type,
      timeOfDay: data.allDay ? undefined : data.timeOfDay,
      reminderTime: data.reminders ? data.reminderTime : undefined,
      endHabitDate:
        data.endHabitEnabled && data.endHabitMode === 'date' ? data.endHabitDate : undefined,
      endHabitDays:
        data.endHabitEnabled && data.endHabitMode === 'days' ? data.endHabitDays : undefined,
      specificDates: data.frequencyTab === 'specific' ? data.selectedSpecificDates : [],
      unitType: data.unitType,
      timerMode: data.timerMode || 'down',
      timeUnit: data.timeUnit || 'min',
      unit: data.unit || (data.unitType === 'time' ? 'Minutes' : 'Count'),
      goalValue: data.goalValue,
    });
    router.back();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <HabitForm form={form} isEdit />
    </form>
  );
};

export default HabitEditForm;
