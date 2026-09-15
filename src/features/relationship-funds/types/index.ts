import { z } from 'zod';

export const fundMonthSchema = z.string().regex(/^(19\d{2}|[2-9]\d{3})-(0[1-9]|1[0-2])$/);
export const fundTransactionInputSchema = z.object({
  kind: z.enum(['save', 'spend']),
  person: z.enum(['TSO', 'Nway'], { required_error: 'Choose TSO or Nway' }),
  money_source: z.enum(['current_budget', 'extra']),
  title: z.string().trim().min(1, 'Enter a transaction name').max(100),
  amount: z
    .number()
    .finite()
    .int('Enter a whole MMK amount')
    .positive('Enter an amount above zero')
    .max(1000000000000),
  date: z
    .string()
    .date('Enter a valid date')
    .min(10)
    .refine((date) => date >= '1900-01-01', 'Choose a date from 1900 onward'),
  note: z.string().trim().max(500),
});
export const fundTransactionSchema = fundTransactionInputSchema.extend({
  person: z.enum(['TSO', 'Nway']).nullable(),
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime({ offset: true }),
});
export type FundTransactionInput = z.infer<typeof fundTransactionInputSchema>;
export type FundTransaction = z.infer<typeof fundTransactionSchema>;

export function getFundMonthBounds(month: string) {
  fundMonthSchema.parse(month);
  const [year, number] = month.split('-').map(Number);
  const lastDay = new Date(year, number, 0).getDate();
  return { start: `${month}-01`, end: `${month}-${lastDay}` };
}

export function getFundSummary(
  transactions: Pick<FundTransaction, 'amount' | 'kind' | 'person'>[],
) {
  const result = { saved: 0, spent: 0, remaining: 0, TSO: 0, Nway: 0 };
  for (const transaction of transactions) {
    if (transaction.kind === 'save') {
      result.saved += transaction.amount;
      if (transaction.person) result[transaction.person] += transaction.amount;
    } else result.spent += transaction.amount;
  }
  result.remaining = result.saved - result.spent;
  return result;
}
