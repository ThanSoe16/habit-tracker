import { Controller, type UseFormReturn } from 'react-hook-form';
import type { HabitData } from '@/features/habits/types';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { normalize24HourTime } from '@/utils/time-utils';
import { ReminderSnoozeField } from '@/components/pages/(habit)/_components/habit-behavior-fields';

export function HabitReminderFields({ form }: { form: UseFormReturn<HabitData> }) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;
  const reminders = watch('reminders');
  const timeOfDay = watch('timeOfDay');
  return (
    <div className="flex flex-col gap-4 pt-3 border-t border-border">
      <Field orientation="horizontal" className="flex items-center justify-between">
        <FieldLabel
          className="mb-0 cursor-pointer font-bold text-sm text-foreground"
          htmlFor="form-reminders"
        >
          Reminders
        </FieldLabel>
        <Controller
          name="reminders"
          control={form.control}
          render={({ field }) => (
            <Switch id="form-reminders" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </Field>

      {reminders && (
        <div className="flex flex-col gap-3 pt-1">
          <Field data-invalid={!!errors.reminderTime}>
            <FieldLabel htmlFor="form-reminderTime" className="text-xs font-bold text-foreground">
              Alarm Time
            </FieldLabel>

            <Controller
              name="reminderTime"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="form-reminderTime"
                  type="time"
                  className="h-12 rounded-2xl bg-card border-none font-bold text-sm shadow-xs cursor-pointer px-4"
                  value={normalize24HourTime(field.value)}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val);
                    setValue('reminderTime', val, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                />
              )}
            />
            <FieldError errors={[errors.reminderTime]} />
          </Field>

          <ReminderSnoozeField form={form} />

          {/* Before Alarm Preset Options */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Quick Before-Alarm Setting
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Exact Time', mins: 0 },
                { label: '5m Before', mins: 5 },
                { label: '15m Before', mins: 15 },
                { label: '30m Before', mins: 30 },
                { label: '1h Before', mins: 60 },
              ].map((preset) => (
                <button
                  key={preset.mins}
                  type="button"
                  onClick={() => {
                    let baseHour = 10;
                    if (timeOfDay === 'morning') baseHour = 8;
                    if (timeOfDay === 'afternoon') baseHour = 14;
                    if (timeOfDay === 'evening') baseHour = 20;

                    let alarmMins = baseHour * 60 - preset.mins;
                    if (alarmMins < 0) alarmMins += 24 * 60;

                    const hh = Math.floor(alarmMins / 60) % 24;
                    const mm = alarmMins % 60;
                    const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
                    setValue('reminderTime', timeStr, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                  className="px-3 py-1.5 bg-primary text-primary rounded-full text-xs font-bold hover:bg-primary transition-colors border border-primary"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Informative Banner */}
          <div className="bg-primary/70 border border-primary p-3 rounded-2xl flex items-center gap-2.5 text-xs text-primary font-medium">
            <span className="text-base">🔔</span>
            <span>
              Alarm will trigger at{' '}
              <strong className="font-bold">{normalize24HourTime(watch('reminderTime'))}</strong> to
              give you enough time before starting.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
