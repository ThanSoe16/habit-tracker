import { Flex } from '@radix-ui/themes';
import { BicepsFlexed, CircleX } from 'lucide-react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { HabitData } from '@/features/habits/types';

const SNOOZE_OPTIONS = [5, 10, 15, 30] as const;

export const HabitKindField = ({ form }: { form: UseFormReturn<HabitData> }) => (
  <FieldSet className="gap-3">
    <FieldLegend id="habit-direction-label" variant="label">
      Habit Direction
    </FieldLegend>
    <Controller
      name="habitKind"
      control={form.control}
      render={({ field }) => (
        <>
          <ToggleGroup
            type="single"
            value={field.value ?? 'build'}
            onValueChange={(value) => {
              if (value) field.onChange(value);
            }}
            onBlur={field.onBlur}
            aria-labelledby="habit-direction-label"
            variant="outline"
            className="grid w-full grid-cols-2 items-stretch"
          >
            <ToggleGroupItem
              value="build"
              aria-label="Build a positive habit"
              className="h-auto min-w-0 flex-col items-start justify-start gap-2 whitespace-normal p-3 text-left"
            >
              <BicepsFlexed data-icon="inline-start" aria-hidden="true" />
              <span className="font-semibold">Build a habit</span>
              <span className="text-xs font-normal text-muted-foreground">
                Grow a positive routine
              </span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="quit"
              aria-label="Quit a bad habit"
              className="h-auto min-w-0 flex-col items-start justify-start gap-2 whitespace-normal p-3 text-left"
            >
              <CircleX data-icon="inline-start" aria-hidden="true" />
              <span className="font-semibold">Quit a habit</span>
              <span className="text-xs font-normal text-muted-foreground">
                Avoid an unwanted behavior
              </span>
            </ToggleGroupItem>
          </ToggleGroup>
          <FieldDescription>
            {field.value === 'quit'
              ? 'Each day succeeds when you avoid this habit.'
              : 'Each day succeeds when you complete this habit.'}
          </FieldDescription>
        </>
      )}
    />
  </FieldSet>
);

export const ReminderSnoozeField = ({ form }: { form: UseFormReturn<HabitData> }) => (
  <Field>
    <FieldLabel>Snooze Duration</FieldLabel>
    <Controller
      name="reminderSnoozeMinutes"
      control={form.control}
      render={({ field }) => (
        <Flex gap="2" wrap="wrap">
          {SNOOZE_OPTIONS.map((minutes) => (
            <Button
              key={minutes}
              type="button"
              size="sm"
              variant={field.value === minutes ? 'default' : 'outline'}
              onClick={() => field.onChange(minutes)}
            >
              {minutes} min
            </Button>
          ))}
        </Flex>
      )}
    />
  </Field>
);
