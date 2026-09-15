'use client';
import { Flex } from '@radix-ui/themes';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCIES } from '@/features/budget/store/model';
import type { SavingsGoalInput } from '@/features/savings/types';

export function SavingsGoalForm({
  form,
  onSubmit,
  onCancel,
}: {
  form: UseFormReturn<SavingsGoalInput>;
  onSubmit: (values: SavingsGoalInput) => Promise<void>;
  onCancel: () => void;
}) {
  const pending = form.formState.isSubmitting;
  const currency = useWatch({ control: form.control, name: 'currency' });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={pending}>
          <Flex className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saving name</FormLabel>
                  <FormControl>
                    <Input
                      inputClassName="rounded-2xl bg-muted/50"
                      {...field}
                      placeholder="Savings from Mom"
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                    <FormControl>
                      <SelectTrigger className="h-12 w-full rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {Object.values(CURRENCIES).map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.flag} {currency.code}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target amount (optional)</FormLabel>
                  <FormControl>
                    <MoneyInput
                      className="bg-muted/50"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      disabled={pending}
                      preFix={CURRENCIES[currency].symbol}
                      value={field.value ?? ''}
                      setValue={(value) => field.onChange(value === '' ? null : Number(value))}
                      placeholder="1,000,000"
                    />
                  </FormControl>
                  <FormDescription>Withdraw once you have saved this amount.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unlock_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unlock date (optional)</FormLabel>
                  <FormControl>
                    <Input
                      inputClassName="rounded-2xl bg-muted/50"
                      type="date"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>Available from the start of this date in UTC.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unlock_rule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>When both are set</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                    <FormControl>
                      <SelectTrigger className="h-12 w-full rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="either">Reach the amount OR the date</SelectItem>
                        <SelectItem value="both">Reach the amount AND the date</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Input inputClassName="rounded-2xl bg-muted/50" {...field} maxLength={500} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Choose at least one restriction. Currency and withdrawal rules are fixed when you
              create the saving. Add money after creating it.
            </p>
            {form.formState.errors.root && (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <Flex className="flex justify-end gap-2">
              <Button
                className="flex-1 rounded-2xl"
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button className="flex-1 rounded-2xl" type="submit" disabled={pending}>
                {pending ? 'Creating…' : 'Create saving'}
              </Button>
            </Flex>
          </Flex>
        </fieldset>
      </form>
    </Form>
  );
}
