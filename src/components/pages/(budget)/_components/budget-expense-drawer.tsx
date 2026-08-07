'use client';

import React, { useState } from 'react';
import { Flex, Grid } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpenseCreatePayload } from '@/features/budget/types';
import { CurrencyCode, CURRENCIES, BUDGET_CATEGORIES } from '@/store/use-budget-store';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

interface BudgetExpenseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ExpenseCreatePayload) => Promise<void>;
  isLoading: boolean;
}

export const BudgetExpenseDrawer: React.FC<BudgetExpenseDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [category, setCategory] = useState<string>(BUDGET_CATEGORIES[0]?.name || 'Food & Groceries');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USDT');
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    await onSubmit({
      category,
      amount: numericAmount,
      currency,
      note,
      date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="p-6">
        <DrawerHeader className="p-0 mb-4">
          <DrawerTitle className="text-xl font-bold text-card-foreground">Add Expense</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit}>
          <Grid columns={{ initial: '1', md: '2' }} gap="4">
            <Flex direction="column" gap="1">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Flex>
            <Flex direction="column" gap="1">
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
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
            <Flex direction="column" gap="1">
              <label className="text-sm font-medium text-muted-foreground">Note</label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
            </Flex>
          </Grid>
          <Flex justify="end" gap="3" className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Save Expense
            </Button>
          </Flex>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
export default BudgetExpenseDrawer;
