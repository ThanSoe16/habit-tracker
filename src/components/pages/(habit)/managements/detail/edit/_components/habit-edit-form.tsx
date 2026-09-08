'use client';
import { habitFormValues } from '@/features/habits/utils/form-values';
import { useSubmissionScope } from '@/features/base/hooks/use-submission-scope';
import { useForm } from 'react-hook-form';
import { HabitData, habitSchema } from '@/features/habits/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHabitStore, Habit } from '@/store/use-habit-store';
import { useRouter } from 'next/navigation';
import {
  useUnsavedChanges,
  confirmSettingsNavigation,
} from '@/features/settings/use-unsaved-changes';
import { toast } from 'sonner';
import HabitForm from '../../../_components/form/habit-form';

const HabitEditForm = ({ habit }: { habit: Habit }) => {
  const router = useRouter();
  const submission = useSubmissionScope();
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const form = useForm<HabitData>({
    resolver: zodResolver(habitSchema),
    defaultValues: habitFormValues(habit),
  });

  useUnsavedChanges(form.formState.isDirty);
  const onCancel = () => {
    if (confirmSettingsNavigation()) router.back();
  };

  const onSubmit = async (data: HabitData) => {
    form.clearErrors('root');
    try {
      await submission.assertCurrent();
      const saved = await updateHabit(habit.id, {
        name: data.name,
        color: data.color,
        frequency: data.frequencyTab,
        repeatDays:
          data.frequencyTab === 'daily'
            ? data.selectedDays
            : data.frequencyTab === 'monthly'
              ? data.selectedMonthlyDays
              : [],
        emoji: data.emoji,
        startDate: data.startDate,
        type: data.type,
        habitKind: data.habitKind,
        timeOfDay: data.allDay ? undefined : data.timeOfDay,
        reminderTime: data.reminders ? data.reminderTime : undefined,
        reminderSnoozeMinutes: data.reminderSnoozeMinutes,
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
      if (!submission.isCurrent()) return;
      form.reset(habitFormValues(saved));
    } catch {
      if (!submission.isCurrent()) return;
      form.setError('root.server', {
        message: 'Could not save the habit. Your input has been kept.',
      });
      return;
    }
    toast.success('Habit saved');
    router.back();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-busy={form.formState.isSubmitting}>
      <HabitForm onCancel={onCancel} form={form} isEdit />
    </form>
  );
};

export default HabitEditForm;
