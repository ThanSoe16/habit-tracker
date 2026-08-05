import { CurrencyCode } from '@/store/use-budget-store';

export interface BudgetFilterParams {
  currency?: CurrencyCode | 'ALL';
  startDate?: string;
  endDate?: string;
  category?: string;
}

export interface ExpenseCreatePayload {
  category: string;
  amount: number;
  currency: CurrencyCode;
  note?: string;
  date: string;
  is_family_budget?: boolean;
}

export interface MonthlySalaryPayload {
  id?: string;
  person_name: string;
  amount: number;
  currency: CurrencyCode;
  payout_day: number;
  is_active?: boolean;
}

export interface CurrencyExchangePayload {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  fromAmount: number;
  exchangeRate: number;
}
