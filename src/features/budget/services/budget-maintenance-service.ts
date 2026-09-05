import { supabase } from '@/lib/supabase/client';
import type { LoanTransaction } from '@/features/budget/store/model';

export const budgetMaintenanceService = {
  async deleteFamilyTransaction(id: string): Promise<void> {
    try {
      const result = await supabase.from('family_budgets').delete().eq('id', id);
      if (result.error) throw new Error(result.error.message);
    } catch (error) {
      throw error;
    }
  },

  async deleteMonthlySalary(id: string): Promise<void> {
    try {
      const result = await supabase.from('monthly_salary').delete().eq('id', id);
      if (result.error) throw new Error(result.error.message);
    } catch (error) {
      throw error;
    }
  },

  async deleteBudgetEntry(id: string, type?: 'income' | 'expense' | 'exchange'): Promise<void> {
    try {
      if (type === 'income') {
        const result = await supabase.from('incomes').delete().eq('id', id);
        if (result.error) throw new Error(result.error.message);
      } else if (type === 'expense') {
        const result = await supabase.from('expenses').delete().eq('id', id);
        if (result.error) throw new Error(result.error.message);
      } else if (type === 'exchange') {
        const result = await supabase.from('currency_exchanges').delete().eq('id', id);
        if (result.error) throw new Error(result.error.message);
      } else {
        const results = await Promise.all([
          supabase.from('incomes').delete().eq('id', id),
          supabase.from('expenses').delete().eq('id', id),
        ]);
        for (const result of results) if (result.error) throw new Error(result.error.message);
      }
    } catch (error) {
      throw error;
    }
  },

  async upsertLoan(loan: LoanTransaction): Promise<void> {
    try {
      const result = await supabase.from('loans').upsert(
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
      if (result.error) throw new Error(result.error.message);
    } catch (error) {
      throw error;
    }
  },

  async deleteLoan(id: string): Promise<void> {
    try {
      const result = await supabase.from('loans').delete().eq('id', id);
      if (result.error) throw new Error(result.error.message);
    } catch (error) {
      throw error;
    }
  },

  async deleteGoldHolding(id: string): Promise<void> {
    try {
      const result = await supabase.from('gold_holdings').delete().eq('id', id);
      if (result.error) throw new Error(result.error.message);
    } catch (error) {
      throw error;
    }
  },

  async clearAllBudgetData(): Promise<void> {
    try {
      const results = await Promise.all([
        supabase.from('family_budgets').delete().neq('id', ''),
        supabase.from('incomes').delete().neq('id', ''),
        supabase.from('expenses').delete().neq('id', ''),
        supabase.from('currency_exchanges').delete().neq('id', ''),
        supabase.from('monthly_salary').delete().neq('id', ''),
        supabase.from('loans').delete().neq('id', ''),
        supabase.from('gold_holdings').delete().neq('id', ''),
      ]);
      for (const result of results) if (result.error) throw new Error(result.error.message);
    } catch (error) {
      throw error;
    }
  },
};
