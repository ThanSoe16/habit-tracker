'use client';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
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

export function FundTransactionDrawer({
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
    <Drawer
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DrawerContent
        className={cn(
          styles.theme,
          'mx-auto w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-t-[36px] bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-foreground',
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
          <DrawerTitle className="flex items-center gap-2 text-base font-black">
            <Wallet className="size-5 text-primary" />
            {mode === 'edit' ? 'Edit fund transaction' : 'Record Money'}
          </DrawerTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={close}
            aria-label="Close"
          >
            <X />
          </Button>
        </div>
        <DrawerDescription className="py-3">
          Record any MMK amount for TSO or Nway.
        </DrawerDescription>
        <FundTransactionForm form={form} mode={mode} onSubmit={submit} onCancel={close} />
      </DrawerContent>
    </Drawer>
  );
}
