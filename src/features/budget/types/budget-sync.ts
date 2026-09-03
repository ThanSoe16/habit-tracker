import type {
  BudgetEntry,
  FamilyTransaction,
  GoldHolding,
  LoanTransaction,
  MonthlySalary,
  WalletBalances,
} from '@/store/use-budget-store';

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

export type BudgetSyncState = {
  walletBalances: WalletBalances;
  monthlySalaries: MonthlySalary[];
  budgetEntries: BudgetEntry[];
  familyTransactions: FamilyTransaction[];
  loans?: LoanTransaction[];
  goldHoldings?: GoldHolding[];
  currency?: string;
  lastProcessedMonth?: string;
};
