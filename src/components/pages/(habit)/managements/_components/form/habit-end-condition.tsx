import React from 'react';
import { Controller } from 'react-hook-form';
import { parseISO, format } from 'date-fns';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { TabToggle } from './tab-toggle';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { calculateHabitDurationDays, calculateHabitEndDate } from '@/utils/habit-end-condition';

export const HabitEndCondition = ({ form }: { form: any }) => {
  const {
    formState: { errors },
    watch,
  } = form;

  const endHabitEnabled = watch('endHabitEnabled');
  const endHabitMode = watch('endHabitMode');
  const startDate = watch('startDate');

  const updateFromEndDate = (endDate: string) => {
    form.setValue('endHabitDate', endDate, { shouldDirty: true, shouldValidate: true });
    form.setValue('endHabitDays', calculateHabitDurationDays(startDate, endDate), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const updateFromDuration = (durationDays: number) => {
    form.setValue('endHabitDays', durationDays, { shouldDirty: true, shouldValidate: true });
    form.setValue('endHabitDate', calculateHabitEndDate(startDate, durationDays), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-4 pt-2 border-t border-gray-100">
      <Field orientation="horizontal" className="flex items-center justify-between">
        <FieldLabel className="mb-0 cursor-pointer" htmlFor="form-endHabitEnabled">
          End Habit Condition
        </FieldLabel>
        <Controller
          name="endHabitEnabled"
          control={form.control}
          render={({ field }) => (
            <Switch
              id="form-endHabitEnabled"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </Field>

      {endHabitEnabled && (
        <div className="space-y-4 rounded-xl">
          <Field>
            <Controller
              name="endHabitMode"
              control={form.control}
              render={({ field }) => (
                <TabToggle
                  value={field.value}
                  setValue={(mode) => {
                    field.onChange(mode);
                    if (mode === 'days') {
                      updateFromDuration(form.getValues('endHabitDays'));
                    } else {
                      updateFromEndDate(form.getValues('endHabitDate'));
                    }
                  }}
                  options={[
                    { value: 'date', label: 'By Date' },
                    { value: 'days', label: 'By Days' },
                  ]}
                />
              )}
            />
          </Field>

          {endHabitMode === 'date' ? (
            <Field data-invalid={!!errors.endHabitDate}>
              <Controller
                name="endHabitDate"
                control={form.control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? parseISO(field.value) : undefined}
                    onChange={(newDate) => {
                      if (newDate) {
                        updateFromEndDate(format(newDate, 'yyyy-MM-dd'));
                      }
                    }}
                    placeholder="End date"
                  />
                )}
              />
              <FieldError errors={[errors.endHabitDate]} />
            </Field>
          ) : (
            <Field data-invalid={!!errors.endHabitDays}>
              <Controller
                name="endHabitDays"
                control={form.control}
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="Number of days"
                    {...field}
                    min={1}
                    onChange={(e) => updateFromDuration(Number.parseInt(e.target.value, 10) || 0)}
                  />
                )}
              />
              <FieldError errors={[errors.endHabitDays]} />
            </Field>
          )}
        </div>
      )}
    </div>
  );
};
