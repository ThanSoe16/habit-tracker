import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { HabitColorSelector } from './habit-color-selector';
import { Controller } from 'react-hook-form';
import { HabitIconSelector } from './habit-icon-selector';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parseISO } from 'date-fns';
import { TabToggle } from './tab-toggle';
import { WeekdaySelector } from './weekday-selector';
import { MonthlyDaySelector } from './monthly-day-selector';
import { SpecificDateSelector } from './specific-date-selector';
import { Switch } from '@/components/ui/switch';
import { HabitEndCondition } from './habit-end-condition';
import { useState } from 'react';
import { UnitSelectorModal } from './unit-selector-modal';
import { GoalDrawerModal } from './goal-drawer-modal';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, Target } from 'lucide-react';
import { normalize24HourTime } from '@/utils/time-utils';

const HabitForm = ({ form, isEdit }: { form: any; isEdit?: boolean }) => {
  const router = useRouter();
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const {
    formState: { errors },
    watch,
    setValue,
  } = form;

  const selectedColor = watch('color');
  const habitName = watch('name');
  const frequencyTab = watch('frequencyTab');
  const allDay = watch('allDay');
  const reminders = watch('reminders');
  const type = watch('type');
  const timeOfDay = watch('timeOfDay');
  const unitType = watch('unitType');
  const timerMode = watch('timerMode') || 'down';
  const timeUnit = watch('timeUnit') || 'min';
  const goalValue = watch('goalValue') || 1;
  const unit = watch('unit') || (unitType === 'time' ? 'Minutes' : 'Count');

  return (
    <div className="flex flex-col p-4 space-y-6 pb-8 w-full max-w-lg mx-auto bg-background dark:bg-zinc-950 min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Habit Setup
          </span>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {isEdit ? 'Edit Habit' : 'Create Habit'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-xs transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <FieldGroup className="space-y-6">
        {/* UNIFIED SINGLE CARD CONTAINER */}
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-4 shadow-sm border border-gray-100 dark:border-zinc-800 space-y-6">
          <Field data-invalid={!!errors.type}>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <TabToggle
                  value={field.value}
                  setValue={field.onChange}
                  options={[
                    { value: 'habit', label: 'Regular Habit' },
                    { value: 'task', label: 'One-Time Task' },
                  ]}
                />
              )}
            />
          </Field>

          <Field data-invalid={!!errors.name}>
            <FieldLabel
              htmlFor="form-name"
              className="text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Habit Name
            </FieldLabel>
            <Controller
              name="name"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="form-name"
                  type="text"
                  placeholder="e.g., Everyday Drink Water"
                  isError={!!errors.name}
                  className="bg-gray-50 dark:bg-zinc-800/80 border-none font-bold text-sm h-12 rounded-2xl focus:ring-2 focus:ring-blue-500"
                  {...field}
                />
              )}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={!!errors.emoji}>
            <FieldLabel
              htmlFor="form-icon"
              className="text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Icon
            </FieldLabel>
            <Controller
              name="emoji"
              control={form.control}
              render={({ field }) => (
                <HabitIconSelector
                  value={field.value}
                  setValue={field.onChange}
                  selectedColor={selectedColor}
                  habitName={habitName}
                />
              )}
            />
            <FieldError errors={[errors.emoji]} />
          </Field>

          <Field data-invalid={!!errors.color}>
            <FieldLabel
              htmlFor="form-color"
              className="text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Color
            </FieldLabel>
            <Controller
              name="color"
              control={form.control}
              render={({ field }) => (
                <HabitColorSelector value={field.value} setValue={field.onChange} />
              )}
            />
            <FieldError errors={[errors.color]} />
          </Field>

          {/* SECTION 2: GOAL & MEASUREMENT */}
          {type !== 'task' && (
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/80 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Goal & Measurement
              </h3>

              <button
                type="button"
                onClick={() => setIsGoalModalOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 dark:bg-zinc-800/80 rounded-2xl border border-gray-100 dark:border-zinc-700/60 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-400">Measurement & Target</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                      {unitType === 'simple' && 'Yes/No (Done/Undone + Remark)'}
                      {unitType === 'duration' && `Duration: ${goalValue} mins (${timerMode === 'down' ? 'Count Down' : 'Count Up'})`}
                      {unitType === 'time' && `Time: ${goalValue} ${timeUnit}`}
                      {unitType === 'count' && `Count: ${goalValue} ${unit} / day`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold">
                  <span>Configure</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}

          {/* SECTION 3: SCHEDULE & REPEAT */}
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/80 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Schedule & Repeat
            </h3>

            <Field data-invalid={!!errors.startDate}>
              <FieldLabel
                htmlFor="form-startDate"
                className="text-xs font-bold text-gray-700 dark:text-gray-300"
              >
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
                        field.onChange(format(newDate, 'yyyy-MM-dd'));
                      }
                    }}
                  />
                )}
              />
              <FieldError errors={[errors.startDate]} />
            </Field>

            {type !== 'task' && (
              <div className="space-y-4 pt-1">
                <Field data-invalid={!!errors.frequencyTab}>
                  <FieldLabel
                    htmlFor="form-frequencyTab"
                    className="text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
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

            <div className="space-y-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Field orientation="horizontal" className="flex items-center justify-between">
                <FieldLabel
                  className="mb-0 cursor-pointer font-bold text-sm text-gray-800 dark:text-white"
                  htmlFor="form-allDay"
                >
                  All Day
                </FieldLabel>
                <Controller
                  name="allDay"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      id="form-allDay"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
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

            <div className="space-y-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Field orientation="horizontal" className="flex items-center justify-between">
                <FieldLabel
                  className="mb-0 cursor-pointer font-bold text-sm text-gray-800 dark:text-white"
                  htmlFor="form-reminders"
                >
                  Reminders
                </FieldLabel>
                <Controller
                  name="reminders"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      id="form-reminders"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </Field>

              {reminders && (
                <div className="space-y-3 pt-1">
                  <Field data-invalid={!!errors.reminderTime}>
                    <FieldLabel htmlFor="form-reminderTime" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Alarm Time
                    </FieldLabel>

                    <Controller
                      name="reminderTime"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="form-reminderTime"
                          type="time"
                          className="h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-none font-bold text-sm shadow-xs cursor-pointer px-4"
                          value={normalize24HourTime(field.value)}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val);
                            setValue('reminderTime', val, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                          }}
                        />
                      )}
                    />
                    <FieldError errors={[errors.reminderTime]} />
                  </Field>

                  {/* Before Alarm Preset Options */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
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
                            setValue('reminderTime', timeStr, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                          }}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold hover:bg-blue-100 dark:hover:bg-zinc-700 transition-colors border border-blue-100 dark:border-zinc-700"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Informative Banner */}
                  <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-blue-700 dark:text-blue-300 font-medium">
                    <span className="text-base">🔔</span>
                    <span>
                      Alarm will trigger at <strong className="font-bold">{normalize24HourTime(watch('reminderTime'))}</strong> to give you enough time before starting.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <GoalDrawerModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          unitType={unitType}
          timerMode={timerMode}
          timeUnit={timeUnit}
          goalValue={goalValue}
          unit={unit}
          onChangeUnitType={(t) => setValue('unitType', t, { shouldValidate: true })}
          onChangeTimerMode={(m) => setValue('timerMode', m, { shouldValidate: true })}
          onChangeTimeUnit={(tu) => setValue('timeUnit', tu, { shouldValidate: true })}
          onChangeGoalValue={(v) => setValue('goalValue', v, { shouldValidate: true })}
          onOpenUnitSelector={() => setIsUnitModalOpen(true)}
        />

        <UnitSelectorModal
          isOpen={isUnitModalOpen}
          onClose={() => setIsUnitModalOpen(false)}
          selectedUnit={unit}
          onSelectUnit={(selected) => {
            setValue('unit', selected, { shouldValidate: true });
          }}
        />

        {/* BOTTOM ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-13 rounded-2xl border-none bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 shadow-xs"
            onClick={() => {
              form.reset();
              router.back();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-13 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30"
          >
            {isEdit ? 'Save Habit' : 'Create Habit'}
          </Button>
        </div>
      </FieldGroup>
    </div>
  );
};

export default HabitForm;
