import { supabase } from '@/lib/supabase/client';
import type { WalletBalances } from '@/store/use-budget-store';
import type { BudgetData } from '../types/budget-sync';

export const budgetReadService = {
  async fetchBudgetData(): Promise<BudgetData | null> {
    try {
      const [
        walletsRes,
        familyRes,
        incomesRes,
        expensesRes,
        exchangesRes,
        salaryRes,
        settingsRes,
        loansRes,
        goldRes,
      ] = await Promise.all([
        supabase.from('current_budget').select('*'),
        supabase.from('family_budgets').select('*'),
        supabase.from('incomes').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('currency_exchanges').select('*'),
        supabase.from('monthly_salary').select('*'),
        supabase.from('budget_settings').select('*').eq('id', 'default_settings').maybeSingle(),
        supabase.from('loans').select('*'),
        supabase.from('gold_holdings').select('*'),
      ]);

      const walletBalances: WalletBalances = { USDT: 0, THB: 0, MMK: 0, SGD: 0 };
      walletsRes.data?.forEach((wallet: { currency: string; balance: number }) => {
        walletBalances[wallet.currency] = Number(wallet.balance) || 0;
      });

      const familyTransactions = (familyRes.data || []).map((transaction: any) => ({
        id: transaction.id,
        type: transaction.type,
        person: transaction.person,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        date: transaction.date,
        note: transaction.note || undefined,
        addToCurrentBudget: transaction.add_to_current_budget ?? true,
        entryId: transaction.entry_id || undefined,
      }));

      const incomes = (incomesRes.data || []).map((income: any) => ({
        id: income.id,
        title: income.title,
        amount: Number(income.amount),
        currency: income.currency,
        type: 'income' as const,
        category: income.category,
        date: income.date,
        note: income.note || undefined,
      }));

      const expenses = (expensesRes.data || []).map((expense: any) => ({
        id: expense.id,
        title: expense.title,
        amount: Number(expense.amount),
        currency: expense.currency,
        type: 'expense' as const,
        category: expense.category,
        date: expense.date,
        note: expense.note || undefined,
      }));

      const exchanges = (exchangesRes.data || []).map((exchange: any) => ({
        id: exchange.id,
        title: exchange.title,
        amount: Number(exchange.from_amount),
        currency: exchange.from_currency,
        type: 'exchange' as const,
        category: 'Currency Exchange',
        date: exchange.date,
        fromCurrency: exchange.from_currency,
        fromAmount: Number(exchange.from_amount),
        toCurrency: exchange.to_currency,
        toAmount: Number(exchange.to_amount),
      }));

      const monthlySalaries = (salaryRes.data || []).map((salary: any) => ({
        id: salary.id,
        title: salary.title,
        amount: Number(salary.amount),
        currency: salary.currency,
        category: salary.category,
        isEnabled: salary.is_enabled ?? true,
        disabledReason: salary.disabled_reason || undefined,
        note: salary.note || undefined,
      }));

      const loans = (loansRes.data || []).map((loan: any) => ({
        id: loan.id,
        type: loan.type,
        personName: loan.person_name,
        amount: Number(loan.amount),
        currency: loan.currency,
        status: loan.status,
        repaidAmount: Number(loan.repaid_amount || 0),
        dueDate: loan.due_date || undefined,
        date: loan.date,
        note: loan.note || undefined,
      }));

      const goldHoldings = (goldRes.data || []).map((holding: any) => ({
        id: holding.id,
        kyat: Number(holding.kyat || 0),
        pae: Number(holding.pae || 0),
        yway: Number(holding.yway || 0),
        buyPrice: Number(holding.buy_price),
        currency: holding.currency,
        purchaseDate: holding.purchase_date,
        note: holding.note || undefined,
        status: holding.status,
        sellPrice: holding.sell_price == null ? undefined : Number(holding.sell_price),
        soldDate: holding.sold_date || undefined,
      }));

      return {
        walletBalances,
        monthlySalaries,
        budgetEntries: [...incomes, ...expenses, ...exchanges],
        familyTransactions,
        loans,
        goldHoldings,
        lastProcessedMonth: settingsRes.data?.last_processed_month || '',
        currency: settingsRes.data?.default_currency || 'USDT',
      };
    } catch (error) {
      console.warn('Error fetching budget tables from Supabase:', error);
      return null;
    }
  },
};
