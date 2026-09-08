import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';
import { budgetService } from './supabase';
import {
  type BudgetEntryDeletePayload,
  type BudgetFilterParams,
  type ExpenseCreatePayload,
  type MonthlySalaryPayload,
  budgetEntryDeleteSchema,
  budgetFilterSchema,
  expenseCreateSchema,
  monthlySalarySchema,
} from '../types';

const budgetApiService = {
  getBudgetData: async (params?: BudgetFilterParams) => {
    const filters = budgetFilterSchema.optional().parse(params);
    const data = await budgetService.fetchBudgetData();
    if (!data) throw new Error('Could not load your budget. Please try again.');
    const filteredEntries = (data.budgetEntries ?? []).filter((entry) => {
      if (filters?.currency && filters.currency !== 'ALL' && entry.currency !== filters.currency) {
        return false;
      }
      if (filters?.startDate && entry.date < filters.startDate) return false;
      if (filters?.endDate && entry.date > filters.endDate) return false;
      if (filters?.category && filters.category !== 'ALL' && entry.category !== filters.category)
        return false;
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
      .select('id, title, category, amount, currency, note, date')
      .single();

    if (error || !data) throw new Error('Could not add the expense. Please try again.');
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
      .select('id, title, amount, currency, category, is_enabled, disabled_reason, note')
      .single();
    if (error || !data) throw new Error('Could not save the salary. Please try again.');
    return data;
  },

  deleteMonthlySalary: async (id: string) => {
    const recordId = z.string().trim().min(1).parse(id);
    const { data, error } = await supabase
      .from('monthly_salary')
      .delete()
      .eq('id', recordId)
      .select('id')
      .single();
    if (error || !data) throw new Error('Could not delete the salary. Please try again.');
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
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', entry.id)
      .select('id')
      .single();
    if (error || !data) throw new Error('Could not delete the entry. Please try again.');
    return true;
  },
};

export default budgetApiService;
