'use client';
import { Flex } from '@radix-ui/themes';
import type { UseFormReturn } from 'react-hook-form';
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
import { Button } from '@/components/ui/button';
import type { FundTransactionInput } from '@/features/relationship-funds/types';
import { FundTransactionChoices } from './fund-transaction-choices';

export function FundTransactionForm({
  form,
  mode,
  onSubmit,
  onCancel,
}: {
  form: UseFormReturn<FundTransactionInput>;
  mode: 'create' | 'edit';
  onSubmit: (input: FundTransactionInput) => Promise<void>;
  onCancel: () => void;
}) {
  const pending = form.formState.isSubmitting;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={pending}>
          <Flex className="flex flex-col gap-4" direction="column" gap="4">
            <FundTransactionChoices form={form} />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Transaction name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputClassName="rounded-2xl bg-muted/50"
                      maxLength={100}
                      placeholder="Monthly saving or dinner together"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Amount (MMK)</FormLabel>
                  <FormControl>
                    <Input
                      inputClassName="rounded-2xl bg-muted/50"
                      {...field}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={field.value || ''}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputClassName="rounded-2xl bg-muted/50"
                      type="date"
                      min="1900-01-01"
                      max="9999-12-31"
                    />
                  </FormControl>
                  <FormDescription>Appears in this month’s transaction history.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Note (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} inputClassName="rounded-2xl bg-muted/50" maxLength={500} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <Flex className="flex justify-end gap-2" justify="end" gap="2">
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
                {pending ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add transaction'}
              </Button>
            </Flex>
          </Flex>
        </fieldset>
      </form>
    </Form>
  );
}
