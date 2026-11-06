'use client';

import { format } from 'date-fns';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { useBudgetStore, type GoldHolding } from '@/store/use-budget-store';
import { goldFormSchema, type GoldFormValues } from '@/features/budget/types/gold-form';
import { GoldForm } from './gold-form';

type GoldRecordDrawerProps = {
  holding?: GoldHolding;
  onClose: () => void;
};

export function GoldRecordDrawer({ holding, onClose }: GoldRecordDrawerProps) {
  const returnFocus = useRef<HTMLElement | null>(null);
  const buyGold = useBudgetStore((state) => state.buyGold);
  const updateGoldHolding = useBudgetStore((state) => state.updateGoldHolding);
  const walletBalances = useBudgetStore((state) => state.walletBalances);
  const form = useForm<GoldFormValues>({
    resolver: zodResolver(goldFormSchema),
    defaultValues: holding
      ? { ...holding, note: holding.note ?? '' }
      : {
          kyat: 1,
          pae: 0,
          yway: 0,
          buyPrice: 0,
          currency: 'MMK',
          purchaseDate: format(new Date(), 'yyyy-MM-dd'),
          note: '',
          status: 'holding',
        },
  });

  function onSubmit(values: GoldFormValues) {
    form.clearErrors('root');
    try {
      if (holding) {
        updateGoldHolding(holding.id, values);
      } else {
        if ((useBudgetStore.getState().walletBalances[values.currency] || 0) < values.buyPrice) {
          throw new Error(`Not enough ${values.currency} in your current budget.`);
        }
        buyGold({ ...values, note: values.note || undefined });
      }
    } catch (error) {
      form.setError('root.server', {
        message:
          error instanceof Error
            ? error.message
            : 'Could not save this gold record. Your input has been kept.',
      });
      return;
    }
    form.reset(values);
    toast.success(holding ? 'Gold record updated.' : 'Gold purchase saved.');
    onClose();
  }

  return (
    <Drawer open autoFocus onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        className="mx-auto max-w-lg overflow-hidden p-6"
        onOpenAutoFocus={() => {
          returnFocus.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <div className="min-h-0 overflow-y-auto">
          <Flex align="center" justify="between" gap="3" mb="2">
            <DrawerTitle>{holding ? 'Edit Gold Record' : 'Record Gold Purchase'}</DrawerTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close gold form"
              onClick={onClose}
            >
              <X />
            </Button>
          </Flex>
          <DrawerDescription className="mb-5">
            {holding
              ? 'Update this record’s purchase and sale details.'
              : 'Add a gold purchase to your holdings.'}
          </DrawerDescription>
          <GoldForm
            form={form}
            editing={!!holding}
            walletBalances={walletBalances}
            onSubmit={onSubmit}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
