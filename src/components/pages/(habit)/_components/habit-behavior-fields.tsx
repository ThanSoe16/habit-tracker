import { Flex, Grid, Text } from '@radix-ui/themes';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import type { HabitData } from '@/features/habits/types';

const SNOOZE_OPTIONS = [5, 10, 15, 30] as const;

export const HabitKindField = ({ form }: { form: UseFormReturn<HabitData> }) => (
  <Field>
    <FieldLabel>Habit Direction</FieldLabel>
    <Controller
      name="habitKind"
      control={form.control}
      render={({ field }) => (
        <Grid columns="2" gap="2">
          <Button
            type="button"
            variant={field.value === 'build' ? 'default' : 'outline'}
            onClick={() => field.onChange('build')}
          >
            Build a habit
          </Button>
          <Button
            type="button"
            variant={field.value === 'quit' ? 'default' : 'outline'}
            onClick={() => field.onChange('quit')}
          >
            Quit a bad habit
          </Button>
        </Grid>
      )}
    />
    <Text size="1" color="gray">
      A quit habit succeeds when you avoid it for the day.
    </Text>
  </Field>
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
