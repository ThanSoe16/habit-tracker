import { z } from 'zod';
import { budgetEntryTypeSchema, currencyCodeSchema } from '@/features/budget/types';

export type CurrencyCode = z.infer<typeof currencyCodeSchema>;
export type EntryType = z.infer<typeof budgetEntryTypeSchema>;

export const currencyConfigSchema = z.object({
  code: currencyCodeSchema,
  symbol: z.string(),
  name: z.string(),
  flag: z.string(),
});

export type CurrencyConfig = z.infer<typeof currencyConfigSchema>;

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USDT: { code: 'USDT', symbol: '$', name: 'Tether (USDT)', flag: '💵' },
  MMK: { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat', flag: '🇲🇲' },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USDT'): string {
  const config = CURRENCIES[currency] || CURRENCIES.USDT;
  if (currency === 'MMK') {
    return `${Math.round(amount).toLocaleString('en-US')} ${config.symbol}`;
  }
  if (currency === 'THB' || currency === 'SGD') {
    return `${config.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${config.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const walletBalancesSchema = z
  .object({
    USDT: z.number(),
    THB: z.number(),
    MMK: z.number(),
    SGD: z.number(),
  })
  .catchall(z.number());

export type WalletBalances = z.infer<typeof walletBalancesSchema>;

export const monthlySalaryRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number(),
  currency: currencyCodeSchema,
  category: z.string(),
  isEnabled: z.boolean(),
  disabledReason: z.string().optional(),
  note: z.string().optional(),
});

export type MonthlySalary = z.infer<typeof monthlySalaryRecordSchema>;

export const budgetEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number(),
  currency: currencyCodeSchema,
  type: budgetEntryTypeSchema,
  category: z.string(),
  date: z.string(),
  note: z.string().optional(),
  fromCurrency: currencyCodeSchema.optional(),
  fromAmount: z.number().optional(),
  toCurrency: currencyCodeSchema.optional(),
  toAmount: z.number().optional(),
});

export type BudgetEntry = z.infer<typeof budgetEntrySchema>;

export const familyTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['received', 'given']),
  person: z.string(),
  amount: z.number(),
  currency: currencyCodeSchema,
  date: z.string(),
  note: z.string().optional(),
  entryId: z.string().optional(),
  addToCurrentBudget: z.boolean().optional(),
});

export type FamilyTransaction = z.infer<typeof familyTransactionSchema>;

export const loanTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['lend', 'borrow']),
  personName: z.string(),
  amount: z.number(),
  currency: currencyCodeSchema,
  status: z.enum(['pending', 'repaid', 'partial']),
  repaidAmount: z.number(),
  dueDate: z.string().optional(),
  date: z.string(),
  note: z.string().optional(),
});

export type LoanTransaction = z.infer<typeof loanTransactionSchema>;

export const goldHoldingSchema = z.object({
  id: z.string(),
  kyat: z.number(),
  pae: z.number(),
  yway: z.number(),
  buyPrice: z.number(),
  currency: currencyCodeSchema,
  purchaseDate: z.string(),
  note: z.string().optional(),
  status: z.enum(['holding', 'sold']),
  sellPrice: z.number().optional(),
  soldDate: z.string().optional(),
});

export type GoldHolding = z.infer<typeof goldHoldingSchema>;

export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USDT_THB: 35.5,
  THB_USDT: 1 / 35.5,
  USDT_MMK: 4500,
  MMK_USDT: 1 / 4500,
  THB_MMK: 126.7,
  MMK_THB: 1 / 126.7,
  USDT_SGD: 1.35,
  SGD_USDT: 1 / 1.35,
  SGD_THB: 26.3,
  THB_SGD: 1 / 26.3,
  SGD_MMK: 3330,
  MMK_SGD: 1 / 3330,
};

export const BUDGET_CATEGORIES = [
  { name: 'Food & Groceries', icon: '🍕' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Transportation', icon: '🚗' },
  { name: 'Bills & Utilities', icon: '⚡' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Health & Fitness', icon: '🏋️' },
  { name: 'Salary', icon: '💼' },
  { name: 'Family', icon: '👨‍👩‍👧' },
  { name: 'Investments', icon: '📈' },
  { name: 'Side Business', icon: '💻' },
  { name: 'Currency Exchange', icon: '💱' },
  { name: 'Loans & Debts', icon: '🤝' },
  { name: 'Other', icon: '📦' },
] as const;
