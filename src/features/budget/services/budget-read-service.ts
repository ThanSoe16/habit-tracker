import { readCompleteList } from '@/lib/supabase/request';
import { accountService } from '@/lib/supabase/account-client';
import type { WalletBalances } from '@/features/budget/store/model';
import type { BudgetData } from '../types/budget-sync';

export const budgetReadService = {
  async fetchBudgetData(): Promise<BudgetData | null> {
    const { supabase } = await accountService.getClient();
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
        readCompleteList(
          supabase
            .from('current_budget')
            .select('currency, balance', { count: 'exact' })
            .order('currency'),
        ),
        readCompleteList(
          supabase
            .from('family_budgets')
            .select(
              'id, type, person, amount, currency, date, note, add_to_current_budget, entry_id',
              { count: 'exact' },
            )
            .order('id'),
        ),
        readCompleteList(
          supabase
            .from('incomes')
            .select('id, title, amount, currency, category, date, note', { count: 'exact' })
            .order('id'),
        ),
        readCompleteList(
          supabase
            .from('expenses')
            .select('id, title, amount, currency, category, date, note', { count: 'exact' })
            .order('id'),
        ),
        readCompleteList(
          supabase
            .from('currency_exchanges')
            .select('id, title, from_amount, from_currency, to_amount, to_currency, date', {
              count: 'exact',
            })
            .order('id'),
        ),
        readCompleteList(
          supabase
            .from('monthly_salary')
            .select('id, title, amount, currency, category, is_enabled, disabled_reason, note', {
              count: 'exact',
            })
            .order('id'),
        ),
        supabase
          .from('budget_settings')
          .select('last_processed_month, default_currency')
          .eq('id', 'default_settings')
          .maybeSingle(),
        readCompleteList(
          supabase
            .from('loans')
            .select(
              'id, type, person_name, amount, currency, status, repaid_amount, due_date, date, note',
              { count: 'exact' },
            )
            .order('id'),
        ),
        readCompleteList(
          supabase
            .from('gold_holdings')
            .select(
              'id, kyat, pae, yway, buy_price, currency, purchase_date, note, status, sell_price, sold_date',
              { count: 'exact' },
            )
            .order('id'),
        ),
      ]);

      // A partial snapshot must never replace the last complete local budget.
      const listResults = [
        walletsRes,
        familyRes,
        incomesRes,
        expensesRes,
        exchangesRes,
        salaryRes,
        loansRes,
        goldRes,
      ];
      if (settingsRes.error || listResults.some((result) => result.error || !result.data)) {
        return null;
      }

      const walletBalances: WalletBalances = { USDT: 0, THB: 0, MMK: 0, SGD: 0 };
      walletsRes.data?.forEach((wallet: { currency: string; balance: number }) => {
        walletBalances[wallet.currency] = Number(wallet.balance) || 0;
      });

      const familyTransactions = (familyRes.data || []).map((transaction) => ({
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

      const incomes = (incomesRes.data || []).map((income) => ({
        id: income.id,
        title: income.title,
        amount: Number(income.amount),
        currency: income.currency,
        type: 'income' as const,
        category: income.category,
        date: income.date,
        note: income.note || undefined,
      }));

      const expenses = (expensesRes.data || []).map((expense) => ({
        id: expense.id,
        title: expense.title,
        amount: Number(expense.amount),
        currency: expense.currency,
        type: 'expense' as const,
        category: expense.category,
        date: expense.date,
        note: expense.note || undefined,
      }));

      const exchanges = (exchangesRes.data || []).map((exchange) => ({
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

      const monthlySalaries = (salaryRes.data || []).map((salary) => ({
        id: salary.id,
        title: salary.title,
        amount: Number(salary.amount),
        currency: salary.currency,
        category: salary.category,
        isEnabled: salary.is_enabled ?? true,
        disabledReason: salary.disabled_reason || undefined,
        note: salary.note || undefined,
      }));

      const loans = (loansRes.data || []).map((loan) => ({
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

      const goldHoldings = (goldRes.data || []).map((holding) => ({
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
    } catch {
      // Legacy sync failure sentinel: preserve the last complete local snapshot.
      return null;
    }
  },
};
