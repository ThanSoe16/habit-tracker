import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import budgetApiService from './api';
import { ExpenseCreatePayload, MonthlySalaryPayload } from '../types';

export const useAddExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExpenseCreatePayload) => budgetApiService.addExpense(payload),
    onSettled: async (response, error) => {
      if (error) {
        toast.error((error as Error)?.message || 'Failed to add expense');
      } else {
        toast.success('Expense recorded successfully');
        await queryClient.invalidateQueries({ queryKey: ['budget'] });
      }
    },
  });
};

export const useUpsertMonthlySalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MonthlySalaryPayload) => budgetApiService.upsertMonthlySalary(payload),
    onSettled: async (response, error) => {
      if (error) {
        toast.error((error as Error)?.message || 'Failed to save salary settings');
      } else {
        toast.success('Salary saved successfully');
        await queryClient.invalidateQueries({ queryKey: ['budget'] });
      }
    },
  });
};

export const useDeleteMonthlySalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetApiService.deleteMonthlySalary(id),
    onSettled: async (response, error) => {
      if (error) {
        toast.error((error as Error)?.message || 'Failed to delete salary');
      } else {
        toast.success('Salary deleted successfully');
        await queryClient.invalidateQueries({ queryKey: ['budget'] });
      }
    },
  });
};

export const useDeleteBudgetEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetApiService.deleteBudgetEntry(id),
    onSettled: async (response, error) => {
      if (error) {
        toast.error((error as Error)?.message || 'Failed to delete entry');
      } else {
        toast.success('Entry deleted successfully');
        await queryClient.invalidateQueries({ queryKey: ['budget'] });
      }
    },
  });
};
