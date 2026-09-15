import { z } from 'zod';
import { currencyCodeSchema } from '@/features/budget/types';

export const savingsMoneySchema = z
  .number()
  .finite()
  .positive('Enter an amount greater than zero')
  .max(1_000_000_000_000)
  .refine(
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.001,
    'Use no more than two decimal places',
  );
export const savingsGoalInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Give this saving a name').max(100),
    currency: currencyCodeSchema,
    target_amount: savingsMoneySchema.nullable(),
    unlock_date: z.string().date().nullable(),
    unlock_rule: z.enum(['either', 'both']),
    note: z.string().trim().max(500),
  })
  .refine((value) => value.target_amount !== null || value.unlock_date !== null, {
    path: ['target_amount'],
    message: 'Set a target amount or an unlock date',
  });
export const savingsTransactionInputSchema = z
  .object({
    goal_id: z.string().uuid(),
    kind: z.enum(['deposit', 'withdrawal']),
    amount: savingsMoneySchema,
    person: z.string().trim().max(100),
    note: z.string().trim().max(500),
    to_budget: z.boolean(),
  })
  .refine((value) => value.kind === 'withdrawal' || !value.to_budget, {
    path: ['to_budget'],
    message: 'Deposits go directly into savings',
  });
export const savingsGoalSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  currency: currencyCodeSchema,
  target_amount: savingsMoneySchema.nullable(),
  unlock_date: z.string().date().nullable(),
  unlock_rule: z.enum(['either', 'both']),
  note: z.string(),
  balance: z.number().finite().nonnegative(),
  target_reached_at: z.string().datetime({ offset: true }).nullable(),
  created_at: z.string().datetime({ offset: true }),
});
export const savingsTransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  goal_id: z.string().uuid(),
  kind: z.enum(['deposit', 'withdrawal']),
  amount: savingsMoneySchema,
  person: z.string(),
  note: z.string(),
  to_budget: z.boolean(),
  created_at: z.string().datetime({ offset: true }),
});
export const savingsPageSchema = z.number().int().min(1).max(100000);
export type SavingsGoal = z.infer<typeof savingsGoalSchema>;
export type SavingsGoalInput = z.infer<typeof savingsGoalInputSchema>;
export type SavingsTransactionInput = z.infer<typeof savingsTransactionInputSchema>;
export type SavingsTransaction = z.infer<typeof savingsTransactionSchema>;
export const savingsBalanceSchema = savingsGoalSchema.pick({
  id: true,
  currency: true,
  balance: true,
});
export type SavingsBalance = z.infer<typeof savingsBalanceSchema>;

export function getSavingsBalance(rows: SavingsBalance[], currency: SavingsGoal['currency']) {
  return (
    rows
      .filter((row) => row.currency === currency)
      .reduce((total, row) => total + Math.round(row.balance * 100), 0) / 100
  );
}

/** Reaching the target is permanent, so partial withdrawals never re-lock the pot. */
export function isSavingsUnlocked(goal: SavingsGoal, now = new Date()) {
  const amountReady = goal.target_reached_at !== null;
  const dateReady = goal.unlock_date !== null && now.toISOString().slice(0, 10) >= goal.unlock_date;
  return goal.unlock_rule === 'both'
    ? (goal.target_amount === null || amountReady) && (goal.unlock_date === null || dateReady)
    : amountReady || dateReady;
}
