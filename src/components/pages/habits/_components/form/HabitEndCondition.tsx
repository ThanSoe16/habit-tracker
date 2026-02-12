import React from 'react';
import { Controller } from 'react-hook-form';
import { parseISO, format } from 'date-fns';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { TabToggle } from './TabToggle';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';

export const HabitEndCondition = ({ form }: { form: any }) => {
  const {
    formState: { errors },
    watch,
  } = form;

  const endHabitEnabled = watch('endHabitEnabled');
  const endHabitMode = watch('endHabitMode');

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
                  setValue={field.onChange}
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
                        field.onChange(format(newDate, 'yyyy-MM-dd'));
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
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
