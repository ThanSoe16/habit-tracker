import { supabase } from '@/lib/supabase/client';
import type { BudgetSyncState } from '../types/budget-sync';

export const budgetWriteService = {
  async saveBudgetData(state: BudgetSyncState): Promise<void> {
    try {
      const walletPayloads = Object.entries(state.walletBalances).map(([currency, balance]) => ({
        currency,
        balance,
        updated_at: new Date().toISOString(),
      }));
      if (walletPayloads.length > 0) {
        await supabase.from('current_budget').upsert(walletPayloads, { onConflict: 'currency' });
      }

      const familyPayloads = state.familyTransactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        person: transaction.person,
        amount: transaction.amount,
        currency: transaction.currency,
        date: transaction.date,
        note: transaction.note || null,
        add_to_current_budget: transaction.addToCurrentBudget ?? true,
        entry_id: transaction.entryId || null,
      }));
      if (familyPayloads.length > 0) {
        await supabase.from('family_budgets').upsert(familyPayloads, { onConflict: 'id' });
      }

      const incomePayloads = state.budgetEntries
        .filter((entry) => entry.type === 'income')
        .map((income) => ({
          id: income.id,
          title: income.title,
          amount: income.amount,
          currency: income.currency,
          category: income.category,
          date: income.date,
          note: income.note || null,
        }));
      if (incomePayloads.length > 0) {
        await supabase.from('incomes').upsert(incomePayloads, { onConflict: 'id' });
      }

      const expensePayloads = state.budgetEntries
        .filter((entry) => entry.type === 'expense')
        .map((expense) => ({
          id: expense.id,
          title: expense.title,
          amount: expense.amount,
          currency: expense.currency,
          category: expense.category,
          date: expense.date,
          note: expense.note || null,
        }));
      if (expensePayloads.length > 0) {
        await supabase.from('expenses').upsert(expensePayloads, { onConflict: 'id' });
      }

      const exchangePayloads = state.budgetEntries
        .filter((entry) => entry.type === 'exchange')
        .map((exchange) => ({
          id: exchange.id,
          title: exchange.title,
          from_currency: exchange.fromCurrency || exchange.currency,
          from_amount: exchange.fromAmount || exchange.amount,
          to_currency: exchange.toCurrency,
          to_amount: exchange.toAmount,
          rate:
            exchange.fromAmount && exchange.toAmount
              ? exchange.toAmount / exchange.fromAmount
              : null,
          date: exchange.date,
        }));
      if (exchangePayloads.length > 0) {
        await supabase.from('currency_exchanges').upsert(exchangePayloads, { onConflict: 'id' });
      }

      const salaryPayloads = state.monthlySalaries.map((salary) => ({
        id: salary.id,
        title: salary.title,
        amount: salary.amount,
        currency: salary.currency,
        category: salary.category,
        is_enabled: salary.isEnabled ?? true,
        disabled_reason: salary.disabledReason || null,
        note: salary.note || null,
      }));
      if (salaryPayloads.length > 0) {
        await supabase.from('monthly_salary').upsert(salaryPayloads, { onConflict: 'id' });
      }

      const loanPayloads = (state.loans || []).map((loan) => ({
        id: loan.id,
        type: loan.type,
        person_name: loan.personName,
        amount: loan.amount,
        currency: loan.currency,
        status: loan.status || 'pending',
        repaid_amount: loan.repaidAmount || 0,
        due_date: loan.dueDate || null,
        date: loan.date,
        note: loan.note || null,
      }));
      if (loanPayloads.length > 0) {
        await supabase.from('loans').upsert(loanPayloads, { onConflict: 'id' });
      }

      const goldPayloads = (state.goldHoldings || []).map((holding) => ({
        id: holding.id,
        kyat: holding.kyat,
        pae: holding.pae,
        yway: holding.yway,
        buy_price: holding.buyPrice,
        currency: holding.currency,
        purchase_date: holding.purchaseDate,
        note: holding.note || null,
        status: holding.status,
        sell_price: holding.sellPrice ?? null,
        sold_date: holding.soldDate || null,
      }));
      if (goldPayloads.length > 0) {
        await supabase.from('gold_holdings').upsert(goldPayloads, { onConflict: 'id' });
      }

      await supabase.from('budget_settings').upsert(
        {
          id: 'default_settings',
          default_currency: state.currency || 'USDT',
          last_processed_month: state.lastProcessedMonth || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );
    } catch (error) {
      console.warn('Error saving budget tables to Supabase:', error);
    }
  },
};
