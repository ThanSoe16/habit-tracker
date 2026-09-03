'use client';

import React, { useState } from 'react';
import { Flex, Grid } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MonthlySalaryPayload } from '@/features/budget/types';
import { CurrencyCode, CURRENCIES } from '@/store/use-budget-store';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

interface BudgetSalaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: MonthlySalaryPayload) => Promise<void>;
  isLoading: boolean;
}

export const BudgetSalaryDrawer: React.FC<BudgetSalaryDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USDT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numericAmount) || numericAmount <= 0) return;

    await onSubmit({
      title: title.trim(),
      amount: numericAmount,
      currency,
    });
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="p-6">
        <DrawerHeader className="p-0 mb-4">
          <DrawerTitle className="text-xl font-bold text-card-foreground">
            Add Monthly Salary
          </DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit}>
          <Grid columns={{ initial: '1', md: '2' }} gap="4">
            <Flex direction="column" gap="1">
              <label className="text-sm font-medium text-muted-foreground">Salary Name</label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Primary Salary"
              />
            </Flex>
            <Flex direction="column" gap="1">
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </Flex>
            <Flex direction="column" gap="1">
              <label className="text-sm font-medium text-muted-foreground">Currency</label>
              <Select value={currency} onValueChange={(val) => setCurrency(val as CurrencyCode)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CURRENCIES).map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Flex>
          </Grid>
          <Flex justify="end" gap="3" className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Save Salary
            </Button>
          </Flex>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
export default BudgetSalaryDrawer;
