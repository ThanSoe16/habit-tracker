import { DataRequestError, textIdSchema } from '@/lib/supabase/request';
import { accountService } from '@/lib/supabase/account-client';
import type { LoanTransaction } from '@/features/budget/store/model';

/** Retry-queue deletes are intentionally idempotent, including already-removed rows. */
export const budgetMaintenanceService = {
  async deleteFamilyTransaction(id: string): Promise<void> {
    const { supabase } = await accountService.getClient();
    const result = await supabase.from('family_budgets').delete().eq('id', textIdSchema.parse(id));
    if (result.error)
      throw new DataRequestError('Could not sync your budget. Please try again.', result.error);
  },

  async deleteMonthlySalary(id: string): Promise<void> {
    const { supabase } = await accountService.getClient();
    const result = await supabase.from('monthly_salary').delete().eq('id', textIdSchema.parse(id));
    if (result.error)
      throw new DataRequestError('Could not sync your budget. Please try again.', result.error);
  },

  async deleteBudgetEntry(id: string, type?: 'income' | 'expense' | 'exchange'): Promise<void> {
    const { supabase } = await accountService.getClient();
    if (type === 'income') {
      const result = await supabase.from('incomes').delete().eq('id', textIdSchema.parse(id));
      if (result.error)
        throw new DataRequestError('Could not sync your budget. Please try again.', result.error);
    } else if (type === 'expense') {
      const result = await supabase.from('expenses').delete().eq('id', textIdSchema.parse(id));
      if (result.error)
        throw new DataRequestError('Could not sync your budget. Please try again.', result.error);
    } else if (type === 'exchange') {
      const result = await supabase
        .from('currency_exchanges')
        .delete()
        .eq('id', textIdSchema.parse(id));
      if (result.error)
        throw new DataRequestError('Could not sync your budget. Please try again.', result.error);
    } else {
      const results = await Promise.all([
        supabase.from('incomes').delete().eq('id', textIdSchema.parse(id)),
        supabase.from('expenses').delete().eq('id', textIdSchema.parse(id)),
      ]);
      for (const result of results)
        if (result.error)
          throw new DataRequestError('Could not sync your budget. Please try again.', result.error);
    }
  },

  async upsertLoan(loan: LoanTransaction): Promise<void> {
    const { supabase } = await accountService.getClient();
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
      { onConflict: 'user_id,id' },
    );
    if (result.error)
      throw new DataRequestError('Could not sync your budget. Please try again.', result.error);
  },

  async deleteLoan(id: string): Promise<void> {
    const { supabase } = await accountService.getClient();
    const result = await supabase.from('loans').delete().eq('id', textIdSchema.parse(id));
    if (result.error)
      throw new DataRequestError('Could not sync your budget. Please try again.', result.error);
  },

  async deleteGoldHolding(id: string): Promise<void> {
    const { supabase } = await accountService.getClient();
    const result = await supabase.from('gold_holdings').delete().eq('id', textIdSchema.parse(id));
    if (result.error)
      throw new DataRequestError('Could not sync your budget. Please try again.', result.error);
  },

  async clearAllBudgetData(): Promise<void> {
    const { supabase } = await accountService.getClient();
    const results = await Promise.all([
      supabase.from('family_budgets').delete().neq('id', ''),
      supabase.from('incomes').delete().neq('id', ''),
      supabase.from('expenses').delete().neq('id', ''),
      supabase.from('currency_exchanges').delete().neq('id', ''),
      supabase.from('monthly_salary').delete().neq('id', ''),
      supabase.from('loans').delete().neq('id', ''),
      supabase.from('gold_holdings').delete().neq('id', ''),
    ]);
    for (const result of results)
      if (result.error)
        throw new DataRequestError('Could not sync your budget. Please try again.', result.error);
  },
};
