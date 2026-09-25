'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { editGoalSchema, type EditGoalValues, type Goal } from '@/features/goals/types';
import { CURRENCIES, type CurrencyCode } from '@/features/budget/store/model';

type EditGoalFormProps = {
  goal: Goal;
  onCancel: () => void;
  onSave: (values: EditGoalValues) => void;
};

export function EditGoalForm({ goal, onCancel, onSave }: EditGoalFormProps) {
  const form = useForm<EditGoalValues>({
    resolver: zodResolver(editGoalSchema),
    defaultValues: {
      title: goal.title,
      why: goal.why,
      targetDate: goal.targetDate,
      targetAmountText: goal.targetAmount ? String(goal.targetAmount) : '',
      currency: goal.currency,
      placesText: goal.places.join(', '),
    },
  });

  const {
    formState: { errors, isSubmitting },
    control,
    handleSubmit,
    register,
  } = form;
  const currency = useWatch({ control, name: 'currency' });

  const submit = handleSubmit((values) => {
    onSave(editGoalSchema.parse(values));
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-border p-3">
      <FieldGroup>
        <Field data-invalid={Boolean(errors.title)}>
          <FieldLabel htmlFor={`goal-edit-title-${goal.id}`}>Goal</FieldLabel>
          <Input
            id={`goal-edit-title-${goal.id}`}
            aria-invalid={Boolean(errors.title)}
            isError={Boolean(errors.title)}
            maxLength={120}
            {...register('title')}
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field data-invalid={Boolean(errors.why)}>
          <FieldLabel htmlFor={`goal-edit-why-${goal.id}`}>Why it matters</FieldLabel>
          <Textarea
            id={`goal-edit-why-${goal.id}`}
            aria-invalid={Boolean(errors.why)}
            {...register('why')}
          />
          <FieldError errors={[errors.why]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.targetDate)}>
            <FieldLabel htmlFor={`goal-edit-date-${goal.id}`}>Target date</FieldLabel>
            <Input
              id={`goal-edit-date-${goal.id}`}
              type="date"
              aria-invalid={Boolean(errors.targetDate)}
              isError={Boolean(errors.targetDate)}
              showCharacterCount={false}
              {...register('targetDate')}
            />
            <FieldError errors={[errors.targetDate]} />
          </Field>

          <Field data-invalid={Boolean(errors.targetAmountText)}>
            <FieldLabel htmlFor={`goal-edit-amount-${goal.id}`}>Target amount</FieldLabel>
            <Controller
              control={control}
              name="targetAmountText"
              render={({ field }) => (
                <MoneyInput
                  id={`goal-edit-amount-${goal.id}`}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  setValue={field.onChange}
                  preFix={CURRENCIES[currency].symbol}
                  aria-invalid={Boolean(errors.targetAmountText)}
                  error={Boolean(errors.targetAmountText)}
                />
              )}
            />
            <FieldError errors={[errors.targetAmountText]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.currency)}>
            <FieldLabel>Currency</FieldLabel>
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                        <SelectItem key={code} value={code}>
                          {CURRENCIES[code].flag} {code}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.currency]} />
          </Field>

          <Field data-invalid={Boolean(errors.placesText)}>
            <FieldLabel htmlFor={`goal-edit-places-${goal.id}`}>Places or themes</FieldLabel>
            <Input
              id={`goal-edit-places-${goal.id}`}
              aria-invalid={Boolean(errors.placesText)}
              isError={Boolean(errors.placesText)}
              maxLength={500}
              {...register('placesText')}
            />
            <FieldError errors={[errors.placesText]} />
          </Field>
        </div>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          <Save data-icon="inline-start" />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
