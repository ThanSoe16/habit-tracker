import { z } from 'zod';
import {
  budgetEntrySchema,
  familyTransactionSchema,
  goldHoldingSchema,
  loanTransactionSchema,
  monthlySalaryRecordSchema,
  walletBalancesSchema,
} from '../store/model';
import { currencyCodeSchema } from '../types';
import type { BudgetSnapshot } from '../store/budget-sync';

const amount = z.number().finite().nonnegative();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'Use a valid calendar date.');
const salary = monthlySalaryRecordSchema.extend({ amount });
const entry = budgetEntrySchema.extend({
  amount,
  date,
  fromAmount: amount.optional(),
  toAmount: amount.optional(),
});
const family = familyTransactionSchema.extend({ amount, date });
const loan = loanTransactionSchema.extend({
  amount,
  repaidAmount: amount,
  date,
  dueDate: date.optional(),
});
const gold = goldHoldingSchema.extend({
  kyat: amount,
  pae: amount,
  yway: amount,
  buyPrice: amount,
  sellPrice: amount.optional(),
  purchaseDate: date,
  soldDate: date.optional(),
});

const legacySchema = z.object({
  version: z.literal('2.0'),
  exportedAt: z.string().datetime(),
  walletBalances: walletBalancesSchema,
  monthlySalaries: z.array(salary),
  budgetEntries: z.array(entry),
  familyTransactions: z.array(family),
  loans: z.array(loan).optional(),
  goldHoldings: z.array(gold).optional(),
  currency: currencyCodeSchema.optional(),
  lastProcessedMonth: z
    .string()
    .regex(/^(|\d{4}-(0[1-9]|1[0-2]))$/)
    .optional(),
});
export const budgetBackupSchema = z
  .union([
    legacySchema.extend({
      version: z.literal('3.0'),
      loans: z.array(loan),
      goldHoldings: z.array(gold),
      currency: currencyCodeSchema,
      lastProcessedMonth: z.string().regex(/^(|\d{4}-(0[1-9]|1[0-2]))$/),
    }),
    legacySchema,
  ])
  .superRefine((backup, context) => {
    // Reject numeric overflow (JSON can parse 1e999 as Infinity) and duplicate IDs.
    const inspect = (value: unknown, path: (string | number)[]) => {
      if (typeof value === 'number' && !Number.isFinite(value))
        context.addIssue({ code: 'custom', path, message: 'Amounts must be finite.' });
      if (value && typeof value === 'object')
        Object.entries(value).forEach(([key, child]) => inspect(child, [...path, key]));
    };
    inspect(backup, []);
    for (const key of [
      'monthlySalaries',
      'budgetEntries',
      'familyTransactions',
      'loans',
      'goldHoldings',
    ] as const) {
      const rows = backup[key] ?? [];
      if (
        new Set(rows.map((row) => row.id)).size !== rows.length ||
        rows.some((row) => !row.id.trim())
      )
        context.addIssue({
          code: 'custom',
          path: [key],
          message: 'Records must have unique, nonempty IDs.',
        });
    }
  });
export type BudgetBackup = z.infer<typeof budgetBackupSchema>;
export function createBudgetBackup(snapshot: BudgetSnapshot): BudgetBackup {
  return budgetBackupSchema.parse({
    version: '3.0',
    exportedAt: new Date().toISOString(),
    walletBalances: snapshot.walletBalances,
    monthlySalaries: snapshot.monthlySalaries,
    budgetEntries: snapshot.budgetEntries,
    familyTransactions: snapshot.familyTransactions,
    loans: snapshot.loans,
    goldHoldings: snapshot.goldHoldings,
    currency: snapshot.currency,
    lastProcessedMonth: snapshot.lastProcessedMonth,
  });
}
