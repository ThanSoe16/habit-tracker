import type {
  BudgetEntry,
  FamilyTransaction,
  GoldHolding,
  LoanTransaction,
  MonthlySalary,
  WalletBalances,
} from '@/features/budget/store/model';

export type BudgetData = {
  walletBalances?: WalletBalances;
  monthlySalaries?: MonthlySalary[];
  budgetEntries?: BudgetEntry[];
  familyTransactions?: FamilyTransaction[];
  loans?: LoanTransaction[];
  goldHoldings?: GoldHolding[];
  lastProcessedMonth?: string;
  currency?: string;
};
