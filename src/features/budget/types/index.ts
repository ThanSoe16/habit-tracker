import { z } from 'zod';

export const currencyCodeSchema = z.enum(['USDT', 'MMK', 'THB', 'SGD']);
export const budgetEntryTypeSchema = z.enum(['income', 'expense', 'exchange']);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD');

export const budgetFilterSchema = z.object({
  currency: currencyCodeSchema.or(z.literal('ALL')).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  category: z.string().trim().min(1).optional(),
});

export const expenseCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  category: z.string().trim().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  currency: currencyCodeSchema,
  note: z.string().trim().optional(),
  date: dateSchema,
});

export const monthlySalarySchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().trim().min(1, 'Salary name is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  currency: currencyCodeSchema,
  category: z.string().trim().min(1).optional(),
  isEnabled: z.boolean().optional(),
  disabledReason: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export const budgetEntryDeleteSchema = z.object({
  id: z.string().min(1),
  type: budgetEntryTypeSchema,
});

export const currencyExchangeSchema = z.object({
  fromCurrency: currencyCodeSchema,
  toCurrency: currencyCodeSchema,
  fromAmount: z.number().positive('Amount must be greater than zero'),
  exchangeRate: z.number().positive('Exchange rate must be greater than zero'),
});

export type CurrencyCode = z.infer<typeof currencyCodeSchema>;
export type BudgetFilterParams = z.infer<typeof budgetFilterSchema>;
export type ExpenseCreatePayload = z.infer<typeof expenseCreateSchema>;
export type MonthlySalaryPayload = z.infer<typeof monthlySalarySchema>;
export type BudgetEntryDeletePayload = z.infer<typeof budgetEntryDeleteSchema>;
export type CurrencyExchangePayload = z.infer<typeof currencyExchangeSchema>;
