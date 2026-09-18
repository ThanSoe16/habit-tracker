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
import { useSaveFundTransaction } from '@/features/relationship-funds/services/mutations';
import {
  fundTransactionInputSchema,
  type FundTransaction,
  type FundTransactionInput,
} from '@/features/relationship-funds/types';
import { DataRequestError } from '@/lib/supabase/request';
import { FundTransactionForm } from './fund-transaction-form';
import styles from '../relationship-funds.module.css';
import { cn } from '@/utils/cn';

export function FundTransactionDialog({
  transaction,
  kind,
  date,
  onClose,
}: {
  transaction?: FundTransaction;
  kind: FundTransactionInput['kind'];
  date: string;
  onClose: () => void;
}) {
  const userId = useQueryIdentity();
  const scope = useSubmissionScope();
  const mutation = useSaveFundTransaction();
  const requestId = useRef<string | null>(null);
  const mode = transaction ? 'edit' : 'create';
  const form = useForm<FundTransactionInput>({
    resolver: zodResolver(fundTransactionInputSchema),
    defaultValues: transaction
      ? {
          title: transaction.title,
          amount: transaction.amount,
          date: transaction.date,
          note: transaction.note,
          kind: transaction.kind,
          person: transaction.person ?? undefined,
          money_source: transaction.money_source,
        }
      : {
          title: '',
          amount: 0,
          date,
          note: '',
          kind,
          person: 'TSO',
          money_source: 'extra',
        },
  });
  useUnsavedChanges(form.formState.isDirty);
  function close() {
    if (!form.formState.isSubmitting && confirmSettingsNavigation()) onClose();
  }
  async function submit(input: FundTransactionInput) {
    try {
      await scope.assertCurrent();
      requestId.current ??= transaction?.id ?? crypto.randomUUID();
      const saved = await mutation.mutateAsync({
        userId: userId!,
        id: requestId.current,
        input,
        mode,
      });
      if (!scope.isCurrent()) return;
      form.reset({
        title: saved.title,
        amount: saved.amount,
        date: saved.date,
        note: saved.note,
        kind: saved.kind,
        person: saved.person ?? input.person,
        money_source: saved.money_source,
      });
      toast.success('Fund transaction saved');
      onClose();
    } catch (error) {
      if (scope.isCurrent())
        form.setError('root', {
          message:
            error instanceof DataRequestError
              ? error.message
              : 'Could not save the transaction. Please try again.',
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
      <DialogContent
        className={cn(styles.theme, 'max-h-dvh overflow-y-auto rounded-3xl p-6 sm:max-w-lg')}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold tracking-tight">
            {mode === 'edit' ? 'Edit fund transaction' : 'Record Money'}
          </DialogTitle>
          <DialogDescription>Record any MMK amount for TSO or Nway.</DialogDescription>
        </DialogHeader>
        <FundTransactionForm form={form} mode={mode} onSubmit={submit} onCancel={close} />
      </DialogContent>
    </Dialog>
  );
}
