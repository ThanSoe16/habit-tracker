'use client';
import { useRef } from 'react';
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
import { useQueryIdentity } from '@/components/providers/query-provider';
import { useSubmissionScope } from '@/features/base/hooks/use-submission-scope';
import {
  confirmSettingsNavigation,
  useUnsavedChanges,
} from '@/features/settings/use-unsaved-changes';
import { useCreateSavings } from '@/features/savings/services/mutations';
import { savingsGoalInputSchema, type SavingsGoalInput } from '@/features/savings/types';
import type { CurrencyCode } from '@/features/budget/types';
import { DataRequestError } from '@/lib/supabase/request';
import { SavingsGoalForm } from './savings-goal-form';

export function CreateSavingsDialog({
  currency,
  onClose,
}: {
  currency: CurrencyCode;
  onClose: () => void;
}) {
  const userId = useQueryIdentity();
  const scope = useSubmissionScope();
  const mutation = useCreateSavings();
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  const form = useForm<SavingsGoalInput>({
    resolver: zodResolver(savingsGoalInputSchema),
    defaultValues: {
      name: '',
      currency,
      target_amount: null,
      unlock_date: null,
      unlock_rule: 'either',
      note: '',
    },
  });
  useUnsavedChanges(form.formState.isDirty);
  function close() {
    if (!form.formState.isSubmitting && confirmSettingsNavigation()) onClose();
  }
  async function submit(input: SavingsGoalInput) {
    try {
      await scope.assertCurrent();
      const fingerprint = JSON.stringify(input);
      if (request.current?.fingerprint !== fingerprint)
        request.current = { fingerprint, id: crypto.randomUUID() };
      const saved = await mutation.mutateAsync({
        userId: userId!,
        requestId: request.current.id,
        input,
      });
      if (!scope.isCurrent()) return;
      form.reset({
        name: saved.name,
        currency: saved.currency,
        target_amount: saved.target_amount,
        unlock_date: saved.unlock_date,
        unlock_rule: saved.unlock_rule,
        note: saved.note,
      });
      toast.success('Saving created. You can now add money.');
      onClose();
    } catch (error) {
      if (scope.isCurrent())
        form.setError('root', {
          message:
            error instanceof DataRequestError
              ? error.message
              : 'Could not create savings. Please try again.',
        });
    }
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
          <DialogTitle className="text-lg font-extrabold tracking-tight">New saving</DialogTitle>
          <DialogDescription>
            Keep money aside until your withdrawal conditions are met.
          </DialogDescription>
        </DialogHeader>
        <SavingsGoalForm form={form} onSubmit={submit} onCancel={close} />
      </DialogContent>
    </Dialog>
  );
}
