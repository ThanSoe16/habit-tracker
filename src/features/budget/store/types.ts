import type {
  BudgetEntry,
  CurrencyCode,
  FamilyTransaction,
  GoldHolding,
  LoanTransaction,
  MonthlySalary,
  WalletBalances,
} from './model';

export interface BudgetStoreState {
  walletBalances: WalletBalances;
  monthlySalaries: MonthlySalary[];
  budgetEntries: BudgetEntry[];
  familyTransactions: FamilyTransaction[];
  loans: LoanTransaction[];
  goldHoldings: GoldHolding[];
  lastProcessedMonth: string; // YYYY-MM
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;

  // Actions for Wallet Balances
  updateWalletBalance: (currency: CurrencyCode, amount: number) => void;

  // Actions for Monthly Salary Templates
  addMonthlySalary: (salary: Omit<MonthlySalary, 'id'>) => void;
  updateMonthlySalary: (id: string, updates: Partial<MonthlySalary>) => void;
  toggleMonthlySalary: (id: string, reason?: string) => void;
  deleteMonthlySalary: (id: string) => void;
  processMonthlySalaryPayout: () => void;

  // Actions for Expenses & Transactions
  addExpense: (expense: Omit<BudgetEntry, 'id' | 'type'>) => void;
  addIncome: (income: Omit<BudgetEntry, 'id' | 'type'>) => void;
  deleteBudgetEntry: (id: string) => void;

  // Actions for Family Budget Module
  addFamilyTransaction: (tx: Omit<FamilyTransaction, 'id'>) => void;
  updateFamilyTransaction: (id: string, updates: Omit<FamilyTransaction, 'id'>) => void;
  deleteFamilyTransaction: (id: string) => void;

  // Actions for Loans & Debts Module
  addLoan: (loan: Omit<LoanTransaction, 'id' | 'status' | 'repaidAmount'>) => void;
  updateLoan: (id: string, updates: Partial<LoanTransaction>) => void;
  deleteLoan: (id: string) => void;
  repayLoan: (id: string, payAmount: number) => void;

  // Actions for Gold Holdings
  buyGold: (holding: Omit<GoldHolding, 'id' | 'status'>) => void;
  sellGold: (id: string, sellPrice: number, soldDate: string) => void;
  deleteGoldHolding: (id: string) => void;

  // Currency Exchange
  executeCurrencyExchange: (params: {
    fromCurrency: CurrencyCode;
    toCurrency: CurrencyCode;
    fromAmount: number;
    toAmount: number;
  }) => void;

  // Settings Data Management
  resetBudgetData: () => void;
  importBudgetData: (data: Partial<BudgetStoreState>) => void;

  // Supabase Cloud Sync
  fetchFromSupabase: () => Promise<void>;
}
