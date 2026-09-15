'use client';
import { useRef } from 'react';
import { Flex } from '@radix-ui/themes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { CURRENCIES } from '@/features/budget/store/model';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { useSubmissionScope } from '@/features/base/hooks/use-submission-scope';
import {
  confirmSettingsNavigation,
  useUnsavedChanges,
} from '@/features/settings/use-unsaved-changes';
import { useRecordSavings } from '@/features/savings/services/mutations';
import {
  savingsTransactionInputSchema,
  type SavingsGoal,
  type SavingsTransactionInput,
} from '@/features/savings/types';
import {
  formatCurrency,
  assertBudgetReadyForSavings,
  refreshBudgetAfterSavings,
} from '@/store/use-budget-store';
import { DataRequestError } from '@/lib/supabase/request';

export function SavingsTransactionDialog({
  goal,
  kind,
  onClose,
}: {
  goal: SavingsGoal;
  kind: 'deposit' | 'withdrawal';
  onClose: () => void;
}) {
  const userId = useQueryIdentity();
  const scope = useSubmissionScope();
  const mutation = useRecordSavings();
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  const form = useForm<SavingsTransactionInput>({
    resolver: zodResolver(savingsTransactionInputSchema),
    defaultValues: {
      goal_id: goal.id,
      kind,
      amount: 0,
      person: '',
      note: '',
      to_budget: kind === 'withdrawal',
    },
  });
  const pending = form.formState.isSubmitting;
  useUnsavedChanges(form.formState.isDirty);
  function close() {
    if (!pending && confirmSettingsNavigation()) onClose();
  }
  async function submit(input: SavingsTransactionInput) {
    form.clearErrors('root');
    if (kind === 'withdrawal' && input.amount > goal.balance) {
      form.setError('amount', { message: 'The amount exceeds your savings balance.' });
      return;
    }
    try {
      await scope.assertCurrent();
      if (input.to_budget) {
        try {
          assertBudgetReadyForSavings();
        } catch {
          form.setError('root', {
            message:
              'Your budget is still saving. Finish syncing before withdrawing into your budget.',
          });
          return;
        }
      }
      const fingerprint = JSON.stringify(input);
      if (request.current?.fingerprint !== fingerprint)
        request.current = { fingerprint, id: crypto.randomUUID() };
      await mutation.mutateAsync({ userId: userId!, requestId: request.current.id, input });
    } catch (error) {
      if (scope.isCurrent())
        form.setError('root', {
          message:
            error instanceof DataRequestError
              ? error.message
              : 'Could not save. Please try again with the same details.',
        });
      return;
    }
    // The write is committed. A failed refresh must never invite another withdrawal.
    let refreshed = true;
    if (input.to_budget) {
      try {
        refreshed = await refreshBudgetAfterSavings();
      } catch {
        refreshed = false;
      }
    }
    if (!scope.isCurrent()) return;
    form.reset(input);
    toast.success(kind === 'deposit' ? 'Money added to savings.' : 'Withdrawal recorded.');
    if (!refreshed)
      toast.warning('Withdrawal saved. Reload your budget to see the updated balance.');
    onClose();
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="max-h-dvh overflow-y-auto rounded-3xl p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold tracking-tight">
            {kind === 'deposit' ? 'Add money' : 'Withdraw savings'}
          </DialogTitle>
          <DialogDescription>
            {goal.name} · {formatCurrency(goal.balance, goal.currency)} saved
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(event) => void form.handleSubmit(submit)(event)}>
            <fieldset disabled={pending}>
              <Flex className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ({goal.currency})</FormLabel>
                      <FormControl>
                        <MoneyInput
                          className="bg-muted/50"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          disabled={pending}
                          preFix={CURRENCIES[goal.currency].symbol}
                          value={field.value || ''}
                          setValue={(value) => field.onChange(Number(value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {kind === 'deposit' && (
                  <FormField
                    control={form.control}
                    name="person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From (optional)</FormLabel>
                        <FormControl>
                          <Input
                            inputClassName="rounded-2xl bg-muted/50"
                            {...field}
                            placeholder="Mom"
                            maxLength={100}
                          />
                        </FormControl>
                        <FormDescription>
                          This increases your savings and the Current Balance on Home. It stays
                          reserved until you withdraw.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {kind === 'withdrawal' && (
                  <FormField
                    control={form.control}
                    name="to_budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Where is the money going?</FormLabel>
                        <Select
                          value={field.value ? 'budget' : 'outside'}
                          onValueChange={(value) => field.onChange(value === 'budget')}
                          disabled={pending}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 w-full rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="budget">Move to available balance</SelectItem>
                              <SelectItem value="outside">Withdraw outside my budget</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Moving to available balance keeps your Home total unchanged. Withdrawing
                          outside your budget reduces the total.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (optional)</FormLabel>
                      <FormControl>
                        <Input
                          inputClassName="rounded-2xl bg-muted/50"
                          {...field}
                          maxLength={500}
                          placeholder={
                            kind === 'deposit' ? 'For future plans' : 'What is this withdrawal for?'
                          }
                        />
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
                <Flex className="flex justify-end gap-2">
                  <Button
                    className="flex-1 rounded-2xl"
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={close}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1 rounded-2xl" type="submit" disabled={pending}>
                    {pending ? 'Saving…' : kind === 'deposit' ? 'Add money' : 'Withdraw'}
                  </Button>
                </Flex>
              </Flex>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
