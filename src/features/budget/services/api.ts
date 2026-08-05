import { supabase } from '@/lib/supabase/client';
import { budgetService } from '@/lib/supabase/services';
import { BudgetFilterParams, ExpenseCreatePayload, MonthlySalaryPayload, CurrencyExchangePayload } from '../types';

const budgetApiService = {
  getBudgetData: async (params?: BudgetFilterParams) => {
    const data = await budgetService.fetchBudgetData();
    if (!data) return null;
    if (params?.currency && params.currency !== 'ALL') {
      const filteredEntries = (data.budgetEntries ?? []).filter((entry: { currency: string }) => entry.currency === params.currency);
      return { ...data, budgetEntries: filteredEntries };
    }
    return data;
  },

  addExpense: async (payload: ExpenseCreatePayload) => {
    const { data, error } = await supabase.from('expenses').insert({
      category: payload.category,
      amount: payload.amount,
      currency: payload.currency,
      note: payload.note ?? '',
      date: payload.date,
      is_family_budget: payload.is_family_budget ?? false,
    }).select().single();

    if (error) throw error;
    return data;
  },

  upsertMonthlySalary: async (payload: MonthlySalaryPayload) => {
    const { data, error } = await supabase.from('monthly_salary').upsert(payload).select().single();
    if (error) throw error;
    return data;
  },

  deleteMonthlySalary: async (id: string) => {
    const { error } = await supabase.from('monthly_salary').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  deleteBudgetEntry: async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

export default budgetApiService;
