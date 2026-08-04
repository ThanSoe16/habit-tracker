'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { budgetService } from '@/lib/supabase/services';

export type CurrencyCode = 'USDT' | 'MMK' | 'THB' | 'SGD';
export type EntryType = 'income' | 'expense' | 'exchange';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

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

export interface WalletBalances {
  USDT: number;
  THB: number;
  MMK: number;
  SGD: number;
  [key: string]: number;
}

export interface MonthlySalary {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  category: string;
  isEnabled: boolean; // Can edit or disable without affecting current budget
  disabledReason?: string;
  note?: string;
}

export interface BudgetEntry {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  type: EntryType;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  // Exchange fields
  fromCurrency?: CurrencyCode;
  fromAmount?: number;
  toCurrency?: CurrencyCode;
  toAmount?: number;
}

export interface FamilyTransaction {
  id: string;
  type: 'received' | 'given';
  person: string;
  amount: number;
  currency: CurrencyCode;
  date: string; // YYYY-MM-DD
  note?: string;
  entryId?: string; // Linked budget entry ID
  addToCurrentBudget?: boolean; // Whether to credit/deduct current wallet balance
}

export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  'USDT_THB': 35.5,
  'THB_USDT': 1 / 35.5,
  'USDT_MMK': 4500,
  'MMK_USDT': 1 / 4500,
  'THB_MMK': 126.7,
  'MMK_THB': 1 / 126.7,
  'USDT_SGD': 1.35,
  'SGD_USDT': 1 / 1.35,
  'SGD_THB': 26.3,
  'THB_SGD': 1 / 26.3,
  'SGD_MMK': 3330,
  'MMK_SGD': 1 / 3330,
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
  { name: 'Other', icon: '📦' },
] as const;

interface BudgetStoreState {
  walletBalances: WalletBalances;
  monthlySalaries: MonthlySalary[];
  budgetEntries: BudgetEntry[];
  familyTransactions: FamilyTransaction[];
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
  syncToSupabase: () => Promise<void>;
}

const DEFAULT_SALARIES: MonthlySalary[] = [
  {
    id: 'sal-1',
    title: 'Primary Salary',
    amount: 1000,
    currency: 'USDT',
    category: 'Salary',
    isEnabled: true,
    note: 'Fixed USDT Salary',
  },
  {
    id: 'sal-2',
    title: 'Local Freelance',
    amount: 8000,
    currency: 'THB',
    category: 'Side Business',
    isEnabled: true,
    note: 'Fixed THB retainer',
  },
];

const DEFAULT_ENTRIES: BudgetEntry[] = [
  {
    id: 'entry-1',
    title: 'Supermarket Groceries',
    amount: 125.4,
    currency: 'USDT',
    type: 'expense',
    category: 'Food & Groceries',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'entry-2',
    title: 'Gym Membership',
    amount: 45.0,
    currency: 'USDT',
    type: 'expense',
    category: 'Health & Fitness',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'entry-3',
    title: 'Dinner & Drinks',
    amount: 850.0,
    currency: 'THB',
    type: 'expense',
    category: 'Food & Groceries',
    date: new Date().toISOString().split('T')[0],
  },
];

export const useBudgetStore = create<BudgetStoreState>()(
  persist(
    (set, get) => ({
      walletBalances: {
        USDT: 1000,
        THB: 8000,
        MMK: 36000000,
        SGD: 0,
      },
      monthlySalaries: DEFAULT_SALARIES,
      budgetEntries: DEFAULT_ENTRIES,
      familyTransactions: [],
      lastProcessedMonth: '',
      currency: 'USDT',

      setCurrency: (currency) => set(() => ({ currency })),

      updateWalletBalance: (currency, amount) =>
        set((state) => ({
          walletBalances: {
            ...state.walletBalances,
            [currency]: amount,
          },
        })),

      addMonthlySalary: (salary) =>
        set((state) => ({
          monthlySalaries: [
            { ...salary, id: crypto.randomUUID() },
            ...state.monthlySalaries,
          ],
        })),

      updateMonthlySalary: (id, updates) =>
        set((state) => ({
          monthlySalaries: state.monthlySalaries.map((sal) =>
            sal.id === id ? { ...sal, ...updates } : sal,
          ),
        })),

      toggleMonthlySalary: (id, reason) =>
        set((state) => ({
          monthlySalaries: state.monthlySalaries.map((sal) => {
            if (sal.id !== id) return sal;
            const nextState = !sal.isEnabled;
            return {
              ...sal,
              isEnabled: nextState,
              disabledReason: nextState ? undefined : (reason || sal.disabledReason),
            };
          }),
        })),

      deleteMonthlySalary: (id) =>
        set((state) => {
          budgetService.deleteMonthlySalary(id);
          return {
            monthlySalaries: state.monthlySalaries.filter((sal) => sal.id !== id),
          };
        }),

      processMonthlySalaryPayout: () => {
        const state = get();
        const activeSalaries = state.monthlySalaries.filter((s) => s.isEnabled);
        if (activeSalaries.length === 0) return;

        const updatedBalances = { ...state.walletBalances };
        const newEntries: BudgetEntry[] = [];
        const todayStr = new Date().toISOString().split('T')[0];

        activeSalaries.forEach((sal) => {
          updatedBalances[sal.currency] = (updatedBalances[sal.currency] || 0) + sal.amount;
          newEntries.push({
            id: crypto.randomUUID(),
            title: `1st Month Credit: ${sal.title}`,
            amount: sal.amount,
            currency: sal.currency,
            type: 'income',
            category: sal.category || 'Salary',
            date: todayStr,
            note: 'Monthly salary payout',
          });
        });

        const currentMonthStr = todayStr.substring(0, 7);

        set(() => ({
          walletBalances: updatedBalances,
          budgetEntries: [...newEntries, ...state.budgetEntries],
          lastProcessedMonth: currentMonthStr,
        }));
      },

      addExpense: (expense) =>
        set((state) => {
          const currentBal = state.walletBalances[expense.currency] || 0;
          const updatedBal = Math.max(0, currentBal - expense.amount);
          return {
            walletBalances: {
              ...state.walletBalances,
              [expense.currency]: updatedBal,
            },
            budgetEntries: [
              {
                ...expense,
                id: crypto.randomUUID(),
                type: 'expense',
              },
              ...state.budgetEntries,
            ],
          };
        }),

      addIncome: (income) =>
        set((state) => {
          const currentBal = state.walletBalances[income.currency] || 0;
          const updatedBal = currentBal + income.amount;
          return {
            walletBalances: {
              ...state.walletBalances,
              [income.currency]: updatedBal,
            },
            budgetEntries: [
              {
                ...income,
                id: crypto.randomUUID(),
                type: 'income',
              },
              ...state.budgetEntries,
            ],
          };
        }),

      deleteBudgetEntry: (id) =>
        set((state) => {
          const target = state.budgetEntries.find((e) => e.id === id);
          if (!target) return state;

          const updatedBalances = { ...state.walletBalances };

          if (target.type === 'expense') {
            // Refund expense back to wallet
            updatedBalances[target.currency] = (updatedBalances[target.currency] || 0) + target.amount;
          } else if (target.type === 'income') {
            // Deduct credited income from wallet
            updatedBalances[target.currency] = Math.max(
              0,
              (updatedBalances[target.currency] || 0) - target.amount,
            );
          } else if (target.type === 'exchange') {
            // Revert exchange
            if (target.fromCurrency && target.fromAmount) {
              updatedBalances[target.fromCurrency] =
                (updatedBalances[target.fromCurrency] || 0) + target.fromAmount;
            }
            if (target.toCurrency && target.toAmount) {
              updatedBalances[target.toCurrency] = Math.max(
                0,
                (updatedBalances[target.toCurrency] || 0) - target.toAmount,
              );
            }
          }

          budgetService.deleteBudgetEntry(id, target.type);

          return {
            walletBalances: updatedBalances,
            budgetEntries: state.budgetEntries.filter((e) => e.id !== id),
          };
        }),

      addFamilyTransaction: (tx) =>
        set((state) => {
          const txId = crypto.randomUUID();
          const addToBudget = tx.addToCurrentBudget !== false;
          const entryId = addToBudget ? crypto.randomUUID() : undefined;

          let updatedBal = state.walletBalances[tx.currency] || 0;
          if (addToBudget) {
            updatedBal =
              tx.type === 'received'
                ? updatedBal + tx.amount
                : Math.max(0, updatedBal - tx.amount);
          }

          const newEntry: BudgetEntry | null = addToBudget
            ? {
                id: entryId!,
                title:
                  tx.type === 'received'
                    ? `Received from ${tx.person}`
                    : `Given to ${tx.person}`,
                amount: tx.amount,
                currency: tx.currency,
                type: tx.type === 'received' ? 'income' : 'expense',
                category: 'Family',
                date: tx.date,
                note: tx.note,
              }
            : null;

          const newFamilyTx: FamilyTransaction = {
            ...tx,
            id: txId,
            entryId,
            addToCurrentBudget: addToBudget,
          };

          return {
            walletBalances: addToBudget
              ? {
                  ...state.walletBalances,
                  [tx.currency]: updatedBal,
                }
              : state.walletBalances,
            familyTransactions: [newFamilyTx, ...(state.familyTransactions || [])],
            budgetEntries: newEntry
              ? [newEntry, ...state.budgetEntries]
              : state.budgetEntries,
          };
        }),

      updateFamilyTransaction: (id, updates) =>
        set((state) => {
          const oldTx = (state.familyTransactions || []).find((tx) => tx.id === id);
          if (!oldTx) return state;

          const updatedBalances = { ...state.walletBalances };

          // 1. Revert old transaction's impact on wallet balance if it was added to budget
          const oldAddToBudget = oldTx.addToCurrentBudget !== false;
          if (oldAddToBudget) {
            const currentOldBal = updatedBalances[oldTx.currency] || 0;
            updatedBalances[oldTx.currency] =
              oldTx.type === 'received'
                ? Math.max(0, currentOldBal - oldTx.amount)
                : currentOldBal + oldTx.amount;
          }

          // 2. Apply new transaction's impact on wallet balance if added to budget
          const newAddToBudget = updates.addToCurrentBudget !== false;
          if (newAddToBudget) {
            const currentNewBal = updatedBalances[updates.currency] || 0;
            updatedBalances[updates.currency] =
              updates.type === 'received'
                ? currentNewBal + updates.amount
                : Math.max(0, currentNewBal - updates.amount);
          }

          // 3. Handle linked budget entry
          let entryId = oldTx.entryId;
          let updatedBudgetEntries = [...state.budgetEntries];

          if (newAddToBudget) {
            if (!entryId) {
              entryId = crypto.randomUUID();
            }
            const budgetEntryPayload: BudgetEntry = {
              id: entryId,
              title:
                updates.type === 'received'
                  ? `Received from ${updates.person}`
                  : `Given to ${updates.person}`,
              amount: updates.amount,
              currency: updates.currency,
              type: updates.type === 'received' ? 'income' : 'expense',
              category: 'Family',
              date: updates.date,
              note: updates.note,
            };

            const existingEntryIdx = updatedBudgetEntries.findIndex((e) => e.id === entryId);
            if (existingEntryIdx >= 0) {
              updatedBudgetEntries[existingEntryIdx] = budgetEntryPayload;
            } else {
              updatedBudgetEntries = [budgetEntryPayload, ...updatedBudgetEntries];
            }
          } else {
            if (entryId) {
              updatedBudgetEntries = updatedBudgetEntries.filter((e) => e.id !== entryId);
              budgetService.deleteBudgetEntry(entryId);
              entryId = undefined;
            }
          }

          const updatedFamilyTx: FamilyTransaction = {
            ...updates,
            id,
            entryId,
          };

          return {
            walletBalances: updatedBalances,
            familyTransactions: (state.familyTransactions || []).map((tx) =>
              tx.id === id ? updatedFamilyTx : tx
            ),
            budgetEntries: updatedBudgetEntries,
          };
        }),

      deleteFamilyTransaction: (id) =>
        set((state) => {
          const target = (state.familyTransactions || []).find((tx) => tx.id === id);
          if (!target) return state;

          const addToBudget = target.addToCurrentBudget !== false;
          let updatedBal = state.walletBalances[target.currency] || 0;

          if (addToBudget) {
            updatedBal =
              target.type === 'received'
                ? Math.max(0, updatedBal - target.amount)
                : updatedBal + target.amount;
          }

          const updatedFamilyTxs = (state.familyTransactions || []).filter((tx) => tx.id !== id);
          const updatedBudgetEntries = target.entryId
            ? state.budgetEntries.filter((entry) => entry.id !== target.entryId)
            : state.budgetEntries;

          budgetService.deleteFamilyTransaction(id);
          if (target.entryId) {
            budgetService.deleteBudgetEntry(target.entryId);
          }

          return {
            walletBalances: addToBudget
              ? {
                  ...state.walletBalances,
                  [target.currency]: updatedBal,
                }
              : state.walletBalances,
            familyTransactions: updatedFamilyTxs,
            budgetEntries: updatedBudgetEntries,
          };
        }),

      executeCurrencyExchange: ({ fromCurrency, toCurrency, fromAmount, toAmount }) =>
        set((state) => {
          const fromBal = state.walletBalances[fromCurrency] || 0;
          if (fromBal < fromAmount) return state; // insufficient balance check

          const updatedBalances = {
            ...state.walletBalances,
            [fromCurrency]: fromBal - fromAmount,
            [toCurrency]: (state.walletBalances[toCurrency] || 0) + toAmount,
          };

          const exchangeEntry: BudgetEntry = {
            id: crypto.randomUUID(),
            title: `Exchanged ${fromCurrency} to ${toCurrency}`,
            amount: fromAmount,
            currency: fromCurrency,
            type: 'exchange',
            category: 'Currency Exchange',
            date: new Date().toISOString().split('T')[0],
            fromCurrency,
            fromAmount,
            toCurrency,
            toAmount,
          };

          return {
            walletBalances: updatedBalances,
            budgetEntries: [exchangeEntry, ...state.budgetEntries],
          };
        }),

      resetBudgetData: () =>
        set(() => {
          budgetService.clearAllBudgetData();
          return {
            walletBalances: { USDT: 0, THB: 0, MMK: 0, SGD: 0 },
            monthlySalaries: [],
            budgetEntries: [],
            familyTransactions: [],
            lastProcessedMonth: '',
          };
        }),

      importBudgetData: (data: Partial<BudgetStoreState>) =>
        set((state) => ({
          walletBalances: data.walletBalances || state.walletBalances,
          monthlySalaries: data.monthlySalaries || state.monthlySalaries,
          budgetEntries: data.budgetEntries || state.budgetEntries,
          familyTransactions: data.familyTransactions || state.familyTransactions,
        })),

      fetchFromSupabase: async () => {
        const remoteData = await budgetService.fetchBudgetData();
        if (remoteData) {
          set((state) => ({
            walletBalances: remoteData.walletBalances || state.walletBalances,
            monthlySalaries: remoteData.monthlySalaries || state.monthlySalaries,
            budgetEntries: remoteData.budgetEntries || state.budgetEntries,
            familyTransactions: remoteData.familyTransactions || state.familyTransactions,
          }));
        }
      },

      syncToSupabase: async () => {
        const state = get();
        await budgetService.saveBudgetData({
          walletBalances: state.walletBalances,
          monthlySalaries: state.monthlySalaries,
          budgetEntries: state.budgetEntries,
          familyTransactions: state.familyTransactions,
        });
      },
    }),
    {
      name: 'budget-store-v2',
    },
  ),
);

// Auto-sync budget changes to Supabase cloud
useBudgetStore.subscribe((state) => {
  budgetService.saveBudgetData({
    walletBalances: state.walletBalances,
    monthlySalaries: state.monthlySalaries,
    budgetEntries: state.budgetEntries,
    familyTransactions: state.familyTransactions,
  });
});
