import { Controller, type UseFormReturn } from 'react-hook-form';
import type { HabitData } from '@/features/habits/types';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { format, parseISO } from 'date-fns';
import { TabToggle } from './tab-toggle';
import { WeekdaySelector } from './weekday-selector';
import { MonthlyDaySelector } from './monthly-day-selector';
import { SpecificDateSelector } from './specific-date-selector';
import { HabitEndCondition } from './habit-end-condition';
import { HabitReminderFields } from './habit-reminder-fields';
import { calculateHabitDurationDays, calculateHabitEndDate } from '@/utils/habit-end-condition';

export function HabitScheduleFields({ form }: { form: UseFormReturn<HabitData> }) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;
  const selectedColor = watch('color');
  const frequencyTab = watch('frequencyTab');
  const allDay = watch('allDay');
  const type = watch('type');
  const endHabitEnabled = watch('endHabitEnabled');
  const endHabitMode = watch('endHabitMode');
  const endHabitDate = watch('endHabitDate');
  const endHabitDays = watch('endHabitDays');
  return (
    <div className="pt-4 border-t border-border flex flex-col gap-4">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Schedule & Repeat
      </h3>

      <Field data-invalid={!!errors.startDate}>
        <FieldLabel htmlFor="form-startDate" className="text-xs font-bold text-foreground">
          {type === 'task' ? 'Date' : 'Start Date'}
        </FieldLabel>
        <Controller
          name="startDate"
          control={form.control}
          render={({ field }) => (
            <DatePicker
              date={field.value ? parseISO(field.value) : undefined}
              onChange={(newDate) => {
                if (newDate) {
                  const nextStartDate = format(newDate, 'yyyy-MM-dd');
                  field.onChange(nextStartDate);

                  if (endHabitEnabled) {
                    if (endHabitMode === 'days') {
                      setValue('endHabitDate', calculateHabitEndDate(nextStartDate, endHabitDays), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    } else {
                      setValue(
                        'endHabitDays',
                        calculateHabitDurationDays(nextStartDate, endHabitDate),
                        { shouldDirty: true, shouldValidate: true },
                      );
                    }
                  }
                }
              }}
            />
          )}
        />
        <FieldError errors={[errors.startDate]} />
      </Field>

      {type !== 'task' && (
        <div className="flex flex-col gap-4 pt-1">
          <Field data-invalid={!!errors.frequencyTab}>
            <FieldLabel htmlFor="form-frequencyTab" className="text-xs font-bold text-foreground">
              Repeat Frequency
            </FieldLabel>
            <Controller
              name="frequencyTab"
              control={form.control}
              render={({ field }) => (
                <TabToggle
                  value={field.value}
                  setValue={field.onChange}
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'specific', label: 'Specific Dates' },
                  ]}
                />
              )}
            />
          </Field>

          {frequencyTab === 'daily' && (
            <Field data-invalid={!!errors.selectedDays}>
              <Controller
                name="selectedDays"
                control={form.control}
                render={({ field }) => (
                  <WeekdaySelector value={field.value} onChange={field.onChange} />
                )}
              />
              <FieldError errors={[errors.selectedDays]} />
            </Field>
          )}

          {frequencyTab === 'monthly' && (
            <Field data-invalid={!!errors.selectedMonthlyDays}>
              <Controller
                name="selectedMonthlyDays"
                control={form.control}
                render={({ field }) => (
                  <MonthlyDaySelector
                    value={field.value}
                    onChange={field.onChange}
                    selectedColor={selectedColor}
                  />
                )}
              />
              <FieldError errors={[errors.selectedMonthlyDays]} />
            </Field>
          )}

          {frequencyTab === 'specific' && (
            <Field data-invalid={!!errors.selectedSpecificDates}>
              <Controller
                name="selectedSpecificDates"
                control={form.control}
                render={({ field }) => (
                  <SpecificDateSelector
                    value={field.value}
                    onChange={field.onChange}
                    selectedColor={selectedColor}
                  />
                )}
              />
              <FieldError errors={[errors.selectedSpecificDates]} />
            </Field>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 pt-3 border-t border-border">
        <Field orientation="horizontal" className="flex items-center justify-between">
          <FieldLabel
            className="mb-0 cursor-pointer font-bold text-sm text-foreground"
            htmlFor="form-allDay"
          >
            All Day
          </FieldLabel>
          <Controller
            name="allDay"
            control={form.control}
            render={({ field }) => (
              <Switch id="form-allDay" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </Field>

        {!allDay && (
          <Field data-invalid={!!errors.timeOfDay}>
            <Controller
              name="timeOfDay"
              control={form.control}
              render={({ field }) => (
                <TabToggle
                  value={field.value}
                  setValue={field.onChange}
                  options={[
                    { value: 'morning', label: 'Morning' },
                    { value: 'afternoon', label: 'Afternoon' },
                    { value: 'evening', label: 'Evening' },
                  ]}
                />
              )}
            />
            <FieldError errors={[errors.timeOfDay]} />
          </Field>
        )}
      </div>

      {type !== 'task' && <HabitEndCondition form={form} />}

      <HabitReminderFields form={form} />
    </div>
  );
}
