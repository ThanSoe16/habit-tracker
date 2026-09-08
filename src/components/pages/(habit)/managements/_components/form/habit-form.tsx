import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { HabitColorSelector } from './habit-color-selector';
import { Controller } from 'react-hook-form';
import { HabitIconSelector } from './habit-icon-selector';
import { TabToggle } from './tab-toggle';
import { useState } from 'react';
import { UnitSelectorModal } from './unit-selector-modal';
import { GoalDrawerModal } from './goal-drawer-modal';
import { HabitScheduleFields } from './habit-schedule-fields';
import type { HabitData } from '@/features/habits/types';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import type { UseFormReturn } from 'react-hook-form';
import { X, ChevronRight, Target } from 'lucide-react';
import { HabitKindField } from '@/components/pages/(habit)/_components/habit-behavior-fields';

const HabitForm = ({
  form,
  isEdit,
  onCancel,
}: {
  form: UseFormReturn<HabitData>;
  isEdit?: boolean;
  onCancel: () => void;
}) => {
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const {
    formState: { errors },
    watch,
    setValue,
  } = form;

  const selectedColor = watch('color');
  const habitName = watch('name');
  const type = watch('type');
  const habitKind = watch('habitKind');
  const unitType = watch('unitType');
  const timerMode = watch('timerMode') || 'down';
  const timeUnit = watch('timeUnit') || 'min';
  const goalValue = watch('goalValue') || 1;
  const unit = watch('unit') || (unitType === 'time' ? 'Minutes' : 'Count');

  return (
    <Form {...form}>
      <fieldset disabled={form.formState.isSubmitting} className="contents">
        <legend className="sr-only">Habit details</legend>
        <div className="flex flex-col p-4 flex flex-col gap-6 pb-32 w-full max-w-lg mx-auto bg-background min-h-screen">
          {/* Top Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Habit Setup
              </span>
              <h1 className="text-2xl font-black text-foreground">
                {isEdit ? 'Edit Habit' : 'Create Habit'}
              </h1>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel habit editing"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-xs transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <FieldGroup className="flex flex-col gap-6">
            {/* UNIFIED SINGLE CARD CONTAINER */}
            <div className="bg-card rounded-3xl p-4 shadow-sm border border-border flex flex-col gap-6">
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

              {type !== 'task' && <HabitKindField form={form} />}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habit Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Everyday Drink Water" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Field data-invalid={!!errors.emoji}>
                <FieldLabel
                  htmlFor="form-icon"
                  className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
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
                  className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
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
              {type !== 'task' && habitKind !== 'quit' && (
                <div className="pt-4 border-t border-border flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Goal & Measurement
                  </h3>

                  <button
                    type="button"
                    onClick={() => setIsGoalModalOpen(true)}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-card rounded-2xl border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary text-primary flex items-center justify-center">
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Measurement & Target
                        </p>
                        <p className="text-sm font-bold text-foreground capitalize">
                          {unitType === 'simple' && 'Yes/No (Done/Undone + Remark)'}
                          {unitType === 'duration' &&
                            `Duration: ${goalValue} mins (${timerMode === 'down' ? 'Count Down' : 'Count Up'})`}
                          {unitType === 'time' && `Time: ${goalValue} ${timeUnit}`}
                          {unitType === 'count' && `Count: ${goalValue} ${unit} / day`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-primary font-bold">
                      <span>Configure</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              )}

              <HabitScheduleFields form={form} />
            </div>

            <GoalDrawerModal
              isOpen={isGoalModalOpen}
              onClose={() => setIsGoalModalOpen(false)}
              unitType={unitType}
              timerMode={timerMode}
              timeUnit={timeUnit}
              goalValue={goalValue}
              unit={unit}
              onChangeUnitType={(t) =>
                setValue('unitType', t, { shouldValidate: true, shouldDirty: true })
              }
              onChangeTimerMode={(m) =>
                setValue('timerMode', m, { shouldValidate: true, shouldDirty: true })
              }
              onChangeTimeUnit={(tu) =>
                setValue('timeUnit', tu, { shouldValidate: true, shouldDirty: true })
              }
              onChangeGoalValue={(v) =>
                setValue('goalValue', v, { shouldValidate: true, shouldDirty: true })
              }
              onOpenUnitSelector={() => setIsUnitModalOpen(true)}
            />

            <UnitSelectorModal
              isOpen={isUnitModalOpen}
              onClose={() => setIsUnitModalOpen(false)}
              selectedUnit={unit}
              onSelectUnit={(selected) => {
                setValue('unit', selected, { shouldValidate: true, shouldDirty: true });
              }}
            />

            {errors.root?.server?.message && (
              <p role="alert" className="text-destructive">
                {errors.root.server.message}
              </p>
            )}
            {/* BOTTOM ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-13 rounded-2xl border-none bg-card text-muted-foreground font-bold hover:bg-muted shadow-xs"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-13 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/30"
              >
                {form.formState.isSubmitting ? 'Saving…' : isEdit ? 'Save Habit' : 'Create Habit'}
              </Button>
            </div>
          </FieldGroup>
        </div>
      </fieldset>
    </Form>
  );
};

export default HabitForm;
