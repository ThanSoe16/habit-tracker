import { supabase } from '@/lib/supabase/client';
import { budgetService } from './supabase';
import {
  BudgetEntryDeletePayload,
  BudgetFilterParams,
  ExpenseCreatePayload,
  MonthlySalaryPayload,
  budgetEntryDeleteSchema,
  budgetFilterSchema,
  expenseCreateSchema,
  monthlySalarySchema,
} from '../types';

const budgetApiService = {
  getBudgetData: async (params?: BudgetFilterParams) => {
    const filters = budgetFilterSchema.optional().parse(params);
    const data = await budgetService.fetchBudgetData();
    if (!data) return null;
    const filteredEntries = (data.budgetEntries ?? []).filter((entry) => {
      if (filters?.currency && filters.currency !== 'ALL' && entry.currency !== filters.currency) {
        return false;
      }
      if (filters?.startDate && entry.date < filters.startDate) return false;
      if (filters?.endDate && entry.date > filters.endDate) return false;
      if (filters?.category && entry.category !== filters.category) return false;
      return true;
    });

    return { ...data, budgetEntries: filteredEntries };
  },

  addExpense: async (payload: ExpenseCreatePayload) => {
    const expense = expenseCreateSchema.parse(payload);
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        id: crypto.randomUUID(),
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        currency: expense.currency,
        note: expense.note || null,
        date: expense.date,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  upsertMonthlySalary: async (payload: MonthlySalaryPayload) => {
    const salary = monthlySalarySchema.parse(payload);
    const { data, error } = await supabase
      .from('monthly_salary')
      .upsert({
        id: salary.id ?? crypto.randomUUID(),
        title: salary.title,
        amount: salary.amount,
        currency: salary.currency,
        category: salary.category ?? 'Salary',
        is_enabled: salary.isEnabled ?? true,
        disabled_reason: salary.disabledReason || null,
        note: salary.note || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteMonthlySalary: async (id: string) => {
    const { error } = await supabase.from('monthly_salary').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  deleteBudgetEntry: async ({ id, type }: BudgetEntryDeletePayload) => {
    const entry = budgetEntryDeleteSchema.parse({ id, type });
    const table =
      entry.type === 'income'
        ? 'incomes'
        : entry.type === 'exchange'
          ? 'currency_exchanges'
          : 'expenses';
    const { error } = await supabase.from(table).delete().eq('id', entry.id);
    if (error) throw error;
    return true;
  },
};

export default budgetApiService;
