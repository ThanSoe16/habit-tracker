'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createGoalSchema, type CreateGoalValues } from '@/features/goals/types';
import { CURRENCIES, type CurrencyCode } from '@/features/budget/store/model';

type CreateGoalFormProps = {
  onCreate: (values: CreateGoalValues) => void;
  onCreated?: () => void;
  onCancel: () => void;
};

export function CreateGoalForm({ onCreate, onCreated, onCancel }: CreateGoalFormProps) {
  const form = useForm<CreateGoalValues>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      title: '',
      why: '',
      targetDate: '',
      targetAmountText: '',
      currency: 'USDT',
      placesText: '',
      subIdeasText: '',
    },
  });

  const {
    formState: { errors, isDirty, isSubmitting },
    control,
    register,
    reset,
    handleSubmit,
  } = form;
  const currency = useWatch({ control, name: 'currency' });

  const submit = handleSubmit((values) => {
    onCreate(createGoalSchema.parse(values));
    reset();
    onCreated?.();
  });

  const cancel = () => {
    if (!isDirty || window.confirm('Discard this goal draft?')) onCancel();
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4 px-1 py-2">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Goal setup</p>
          <h1 className="text-2xl font-bold text-foreground">Create Goal</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={cancel}
          aria-label="Close goal setup"
          className="size-10 rounded-full bg-card shadow-xs"
        >
          <X className="size-5" />
        </Button>
      </header>

      <Card className="gap-0 rounded-2xl border border-border bg-card py-0 shadow-sm ring-0">
        <CardHeader className="px-5 pb-3 pt-6">
          <CardTitle className="text-xs font-bold uppercase text-muted-foreground">
            Goal details
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 px-5 pb-6">
          <FieldGroup>
            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="goal-title">Goal name</FieldLabel>
              <Input
                id="goal-title"
                placeholder="e.g., Dream Trip"
                aria-invalid={Boolean(errors.title)}
                isError={Boolean(errors.title)}
                inputClassName="bg-background"
                showCharacterCount={false}
                maxLength={120}
                {...register('title')}
              />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field data-invalid={Boolean(errors.why)}>
              <FieldLabel htmlFor="goal-why">Why it matters</FieldLabel>
              <Textarea
                id="goal-why"
                placeholder="What makes this goal meaningful to you?"
                aria-invalid={Boolean(errors.why)}
                rows={3}
                {...register('why')}
              />
              <FieldError errors={[errors.why]} />
            </Field>
          </FieldGroup>

          <Separator />

          <section className="flex flex-col gap-4" aria-labelledby="goal-target-heading">
            <h2
              id="goal-target-heading"
              className="text-xs font-bold uppercase text-muted-foreground"
            >
              Target & savings
            </h2>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.targetDate)}>
                <FieldLabel htmlFor="goal-target-date">Target date</FieldLabel>
                <Input
                  id="goal-target-date"
                  type="date"
                  aria-invalid={Boolean(errors.targetDate)}
                  isError={Boolean(errors.targetDate)}
                  inputClassName="bg-background"
                  showCharacterCount={false}
                  {...register('targetDate')}
                />
                <FieldDescription>Optional</FieldDescription>
                <FieldError errors={[errors.targetDate]} />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.targetAmountText)}>
                  <FieldLabel htmlFor="goal-target-amount">Target amount</FieldLabel>
                  <Controller
                    control={control}
                    name="targetAmountText"
                    render={({ field }) => (
                      <MoneyInput
                        id="goal-target-amount"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value}
                        setValue={field.onChange}
                        preFix={CURRENCIES[currency].symbol}
                        placeholder="4,000"
                        aria-invalid={Boolean(errors.targetAmountText)}
                        error={Boolean(errors.targetAmountText)}
                        className="bg-background"
                      />
                    )}
                  />
                  <FieldError errors={[errors.targetAmountText]} />
                </Field>

                <Field data-invalid={Boolean(errors.currency)}>
                  <FieldLabel htmlFor="goal-currency">Currency</FieldLabel>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id="goal-currency"
                          className="h-12 w-full"
                          aria-invalid={Boolean(errors.currency)}
                        >
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
              </div>
            </FieldGroup>
          </section>

          <Separator />

          <section className="flex flex-col gap-4" aria-labelledby="goal-ideas-heading">
            <h2
              id="goal-ideas-heading"
              className="text-xs font-bold uppercase text-muted-foreground"
            >
              Places & ideas
            </h2>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.placesText)}>
                <FieldLabel htmlFor="goal-places">Places or themes</FieldLabel>
                <Input
                  id="goal-places"
                  placeholder="Tokyo, Kyoto, food, temples"
                  aria-invalid={Boolean(errors.placesText)}
                  isError={Boolean(errors.placesText)}
                  inputClassName="bg-background"
                  showCharacterCount={false}
                  maxLength={500}
                  {...register('placesText')}
                />
                <FieldDescription>Separate ideas with commas.</FieldDescription>
                <FieldError errors={[errors.placesText]} />
              </Field>

              <Field data-invalid={Boolean(errors.subIdeasText)}>
                <FieldLabel htmlFor="goal-sub-ideas">Steps and sub-ideas</FieldLabel>
                <Textarea
                  id="goal-sub-ideas"
                  placeholder={
                    'Save travel money\nLearn useful Japanese phrases\nResearch the best season'
                  }
                  aria-invalid={Boolean(errors.subIdeasText)}
                  rows={4}
                  {...register('subIdeasText')}
                />
                <FieldDescription>One idea per line.</FieldDescription>
                <FieldError errors={[errors.subIdeasText]} />
              </Field>
            </FieldGroup>
          </section>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={cancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            'Creating...'
          ) : (
            <>
              <Plus data-icon="inline-start" />
              Create Goal
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
