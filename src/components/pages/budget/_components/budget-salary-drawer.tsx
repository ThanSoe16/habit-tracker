'use client';

import React, { useState } from 'react';
import { Flex, Grid } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonthlySalaryPayload } from '@/features/budget/types';
import { CurrencyCode, CURRENCIES } from '@/store/use-budget-store';

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
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USDT');
  const [payoutDay, setPayoutDay] = useState('1');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!personName.trim() || isNaN(numericAmount) || numericAmount <= 0) return;

    await onSubmit({
      person_name: personName.trim(),
      amount: numericAmount,
      currency,
      payout_day: parseInt(payoutDay, 10) || 1,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <Flex direction="column" className="fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl bg-card p-6 shadow-lg border-t border-border">
        <h2 className="text-xl font-bold mb-4 text-card-foreground">Add Monthly Salary</h2>
        <form onSubmit={handleSubmit}>
          <Grid columns={{ initial: '1', md: '2' }} gap="4">
            <Flex direction="column" gap="1">
              <label className="text-sm font-medium text-muted-foreground">Person Name</label>
              <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="e.g. John Doe" />
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
              <label className="text-sm font-medium text-muted-foreground">Payout Day of Month</label>
              <Input type="number" min="1" max="31" value={payoutDay} onChange={(e) => setPayoutDay(e.target.value)} />
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
      </Flex>
    </div>
  );
};
export default BudgetSalaryDrawer;
