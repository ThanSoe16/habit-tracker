'use client';

import { Banknote } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Progress } from '@/components/ui/progress';
import { CURRENCIES, formatCurrency } from '@/features/budget/store/model';
import type { Goal, GoalSavingValues } from '@/features/goals/types';

type GoalSavingsSectionProps = {
  goal: Goal;
  onAddSaving: (goalId: string, values: GoalSavingValues) => void;
};

export function GoalSavingsSection({ goal, onAddSaving }: GoalSavingsSectionProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const saved = goal.savings.reduce((total, saving) => total + saving.amount, 0);
  const progress = goal.targetAmount
    ? Math.min(100, Math.round((saved / goal.targetAmount) * 100))
    : 0;

  if (!goal.targetAmount) return null;

  const addSaving = () => {
    if (Number(amount) <= 0) return;
    onAddSaving(goal.id, { amountText: amount, note, savedAt: date });
    setAmount('');
    setNote('');
  };

  return (
    <section className="flex flex-col gap-4" aria-label="Savings progress">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Saved so far</p>
          <p className="truncate text-xl font-bold text-foreground">
            {formatCurrency(saved, goal.currency)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            of {formatCurrency(goal.targetAmount, goal.currency)}
          </p>
        </div>
        <span className="shrink-0 text-xl font-bold text-primary">{progress}%</span>
      </div>
      <Progress value={progress} className="h-3 bg-muted/60" />

      {goal.status !== 'completed' && (
        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Banknote className="size-4 text-primary" aria-hidden="true" />
            Add savings
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              Amount
              <MoneyInput
                value={amount}
                setValue={setAmount}
                preFix={CURRENCIES[goal.currency].symbol}
                placeholder="0"
                aria-label="Savings amount"
                className="bg-background"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              Date
              <Input
                type="date"
                value={date}
                showCharacterCount={false}
                onChange={(event) => setDate(event.target.value)}
                className="bg-background"
              />
            </label>
          </div>
          <Input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note"
            aria-label="Savings note"
            maxLength={160}
            showCharacterCount={false}
            className="bg-background"
          />
          <Button type="button" disabled={Number(amount) <= 0} onClick={addSaving}>
            Add savings
          </Button>
        </div>
      )}

      {goal.savings.length > 0 && (
        <div className="flex flex-col gap-2">
          {goal.savings.slice(0, 3).map((saving) => (
            <div
              key={saving.id}
              className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-b-0"
            >
              <span className="truncate text-muted-foreground">
                {saving.savedAt}
                {saving.note ? ` · ${saving.note}` : ''}
              </span>
              <span className="shrink-0 font-semibold text-foreground">
                {formatCurrency(saving.amount, goal.currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
