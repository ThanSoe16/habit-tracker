'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { budgetService } from '@/features/budget/services/supabase';
import {
  createBudgetSyncScheduler,
  type BudgetSnapshot,
} from '@/features/budget/store/budget-sync';
import { DEFAULT_ENTRIES, DEFAULT_SALARIES } from '@/features/budget/store/defaults';
import type { BudgetStoreState } from '@/features/budget/store/types';
import type {
  BudgetEntry,
  CurrencyCode,
  FamilyTransaction,
  GoldHolding,
  LoanTransaction,
} from '@/features/budget/store/model';

export * from '@/features/budget/store/model';

const budgetSyncScheduler = createBudgetSyncScheduler();
let isApplyingRemoteBudgetState = false;

function selectBudgetSnapshot(state: BudgetStoreState): BudgetSnapshot {
  return {
    walletBalances: state.walletBalances,
    monthlySalaries: state.monthlySalaries,
    budgetEntries: state.budgetEntries,
    familyTransactions: state.familyTransactions,
    loans: state.loans,
    goldHoldings: state.goldHoldings,
    currency: state.currency,
    lastProcessedMonth: state.lastProcessedMonth,
  };
}

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
      loans: [],
      goldHoldings: [],
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
          monthlySalaries: [{ ...salary, id: crypto.randomUUID() }, ...state.monthlySalaries],
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
              disabledReason: nextState ? undefined : reason || sal.disabledReason,
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
            updatedBalances[target.currency] =
              (updatedBalances[target.currency] || 0) + target.amount;
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
              tx.type === 'received' ? updatedBal + tx.amount : Math.max(0, updatedBal - tx.amount);
          }

          const newEntry: BudgetEntry | null = addToBudget
            ? {
                id: entryId!,
                title:
                  tx.type === 'received' ? `Received from ${tx.person}` : `Given to ${tx.person}`,
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
            budgetEntries: newEntry ? [newEntry, ...state.budgetEntries] : state.budgetEntries,
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
              tx.id === id ? updatedFamilyTx : tx,
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

      // Actions for Loans & Debts Module
      addLoan: (loanData) =>
        set((state) => {
          const newLoan: LoanTransaction = {
            ...loanData,
            id: `loan-${Date.now()}`,
            status: 'pending',
            repaidAmount: 0,
          };

          const currentBal = state.walletBalances[loanData.currency] || 0;
          // Lend = money out (deduct), Borrow = money in (credit)
          const updatedBal =
            loanData.type === 'lend'
              ? Math.max(0, currentBal - loanData.amount)
              : currentBal + loanData.amount;

          budgetService.upsertLoan?.(newLoan);

          return {
            walletBalances: {
              ...state.walletBalances,
              [loanData.currency]: updatedBal,
            },
            loans: [newLoan, ...(state.loans || [])],
          };
        }),

      updateLoan: (id, updates) =>
        set((state) => {
          const updatedLoans = (state.loans || []).map((l) =>
            l.id === id ? { ...l, ...updates } : l,
          );
          const target = updatedLoans.find((l) => l.id === id);
          if (target) {
            budgetService.upsertLoan?.(target);
          }
          return { loans: updatedLoans };
        }),

      deleteLoan: (id) =>
        set((state) => {
          const target = (state.loans || []).find((l) => l.id === id);
          if (!target) return state;

          // Revert initial wallet effect if pending/partial
          const remainingUnsettled = target.amount - (target.repaidAmount || 0);
          let updatedBal = state.walletBalances[target.currency] || 0;

          if (remainingUnsettled > 0) {
            if (target.type === 'lend') {
              // Money was lent out -> refund to wallet
              updatedBal += remainingUnsettled;
            } else {
              // Money was borrowed -> deduct from wallet
              updatedBal = Math.max(0, updatedBal - remainingUnsettled);
            }
          }

          budgetService.deleteLoan?.(id);

          return {
            walletBalances: {
              ...state.walletBalances,
              [target.currency]: updatedBal,
            },
            loans: (state.loans || []).filter((l) => l.id !== id),
          };
        }),

      repayLoan: (id, payAmount) =>
        set((state) => {
          const target = (state.loans || []).find((l) => l.id === id);
          if (!target || payAmount <= 0) return state;

          const newRepaid = (target.repaidAmount || 0) + payAmount;
          const newStatus: LoanTransaction['status'] =
            newRepaid >= target.amount ? 'repaid' : 'partial';

          const currentBal = state.walletBalances[target.currency] || 0;
          // Repaying a lent loan = money comes back (credit)
          // Repaying a borrowed debt = paying back money (deduct)
          const updatedBal =
            target.type === 'lend' ? currentBal + payAmount : Math.max(0, currentBal - payAmount);

          const updatedLoan: LoanTransaction = {
            ...target,
            repaidAmount: Math.min(target.amount, newRepaid),
            status: newStatus,
          };

          budgetService.upsertLoan?.(updatedLoan);

          return {
            walletBalances: {
              ...state.walletBalances,
              [target.currency]: updatedBal,
            },
            loans: (state.loans || []).map((l) => (l.id === id ? updatedLoan : l)),
          };
        }),

      buyGold: (holding) =>
        set((state) => {
          const currentBalance = state.walletBalances[holding.currency] || 0;
          if (holding.buyPrice <= 0 || currentBalance < holding.buyPrice) return state;

          const newHolding: GoldHolding = {
            ...holding,
            id: crypto.randomUUID(),
            status: 'holding',
          };

          return {
            walletBalances: {
              ...state.walletBalances,
              [holding.currency]: currentBalance - holding.buyPrice,
            },
            goldHoldings: [newHolding, ...(state.goldHoldings || [])],
          };
        }),

      sellGold: (id, sellPrice, soldDate) =>
        set((state) => {
          const target = (state.goldHoldings || []).find((holding) => holding.id === id);
          if (!target || target.status === 'sold' || sellPrice <= 0) return state;

          const soldHolding: GoldHolding = {
            ...target,
            status: 'sold',
            sellPrice,
            soldDate,
          };

          return {
            walletBalances: {
              ...state.walletBalances,
              [target.currency]: (state.walletBalances[target.currency] || 0) + sellPrice,
            },
            goldHoldings: (state.goldHoldings || []).map((holding) =>
              holding.id === id ? soldHolding : holding,
            ),
          };
        }),

      deleteGoldHolding: (id) =>
        set((state) => {
          const target = (state.goldHoldings || []).find((holding) => holding.id === id);
          if (!target) return state;

          const saleCredit = target.status === 'sold' ? target.sellPrice || 0 : 0;
          const restoredBalance =
            (state.walletBalances[target.currency] || 0) + target.buyPrice - saleCredit;
          budgetService.deleteGoldHolding?.(id);

          return {
            walletBalances: {
              ...state.walletBalances,
              [target.currency]: Math.max(0, restoredBalance),
            },
            goldHoldings: (state.goldHoldings || []).filter((holding) => holding.id !== id),
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
            loans: [],
            goldHoldings: [],
            lastProcessedMonth: '',
          };
        }),

      importBudgetData: (data: Partial<BudgetStoreState>) =>
        set((state) => ({
          walletBalances: data.walletBalances || state.walletBalances,
          monthlySalaries: data.monthlySalaries || state.monthlySalaries,
          budgetEntries: data.budgetEntries || state.budgetEntries,
          familyTransactions: data.familyTransactions || state.familyTransactions,
          loans: data.loans || state.loans,
          goldHoldings: data.goldHoldings || state.goldHoldings,
          lastProcessedMonth: data.lastProcessedMonth ?? state.lastProcessedMonth,
          currency: data.currency || state.currency,
        })),

      fetchFromSupabase: async () => {
        const remoteData = await budgetService.fetchBudgetData();
        if (remoteData) {
          isApplyingRemoteBudgetState = true;
          try {
            set((state) => ({
              walletBalances: remoteData.walletBalances || state.walletBalances,
              monthlySalaries: remoteData.monthlySalaries || state.monthlySalaries,
              budgetEntries: remoteData.budgetEntries || state.budgetEntries,
              familyTransactions: remoteData.familyTransactions || state.familyTransactions,
              loans: remoteData.loans || [],
              goldHoldings: remoteData.goldHoldings || [],
              lastProcessedMonth: remoteData.lastProcessedMonth || '',
              currency: (remoteData.currency as CurrencyCode) || state.currency,
            }));
          } finally {
            isApplyingRemoteBudgetState = false;
          }
        }
      },
    }),
    {
      name: 'budget-store-v2',
    },
  ),
);

useBudgetStore.subscribe((state, previousState) => {
  if (isApplyingRemoteBudgetState) return;
  budgetSyncScheduler.schedule(selectBudgetSnapshot(state), selectBudgetSnapshot(previousState));
});
