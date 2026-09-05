import { supabase } from '@/lib/supabase/client';
import type { LoanTransaction } from '@/features/budget/store/model';

export const budgetMaintenanceService = {
  async deleteFamilyTransaction(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('family_budgets').delete().eq('id', id);
      if (error) console.warn('Error deleting family transaction:', error.message);
    } catch (error) {
      console.warn('Error deleting family transaction:', error);
    }
  },

  async deleteMonthlySalary(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('monthly_salary').delete().eq('id', id);
      if (error) console.warn('Error deleting monthly salary:', error.message);
    } catch (error) {
      console.warn('Error deleting monthly salary:', error);
    }
  },

  async deleteBudgetEntry(id: string, type?: 'income' | 'expense' | 'exchange'): Promise<void> {
    try {
      if (type === 'income') {
        await supabase.from('incomes').delete().eq('id', id);
      } else if (type === 'expense') {
        await supabase.from('expenses').delete().eq('id', id);
      } else if (type === 'exchange') {
        await supabase.from('currency_exchanges').delete().eq('id', id);
      } else {
        await Promise.all([
          supabase.from('incomes').delete().eq('id', id),
          supabase.from('expenses').delete().eq('id', id),
        ]);
      }
    } catch (error) {
      console.warn('Error deleting budget entry:', error);
    }
  },

  async upsertLoan(loan: LoanTransaction): Promise<void> {
    try {
      await supabase.from('loans').upsert(
        {
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
        },
        { onConflict: 'id' },
      );
    } catch (error) {
      console.warn('Error upserting loan:', error);
    }
  },

  async deleteLoan(id: string): Promise<void> {
    try {
      await supabase.from('loans').delete().eq('id', id);
    } catch (error) {
      console.warn('Error deleting loan:', error);
    }
  },

  async deleteGoldHolding(id: string): Promise<void> {
    try {
      await supabase.from('gold_holdings').delete().eq('id', id);
    } catch (error) {
      console.warn('Error deleting gold holding:', error);
    }
  },

  async clearAllBudgetData(): Promise<void> {
    try {
      await Promise.all([
        supabase.from('family_budgets').delete().neq('id', ''),
        supabase.from('incomes').delete().neq('id', ''),
        supabase.from('expenses').delete().neq('id', ''),
        supabase.from('currency_exchanges').delete().neq('id', ''),
        supabase.from('monthly_salary').delete().neq('id', ''),
        supabase.from('loans').delete().neq('id', ''),
        supabase.from('gold_holdings').delete().neq('id', ''),
      ]);
    } catch (error) {
      console.warn('Error clearing budget data:', error);
    }
  },
};
