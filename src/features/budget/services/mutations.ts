'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requireIdentity } from '@/lib/supabase/require-identity';
import budgetApiService from './api';
import { budgetKeys } from './query-keys';
import type {
  BudgetEntryDeletePayload,
  ExpenseCreatePayload,
  MonthlySalaryPayload,
} from '../types';

export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: ExpenseCreatePayload }) => {
      await requireIdentity(userId);
      return budgetApiService.addExpense(payload);
    },
    retry: false,
    onSuccess: async (_, { userId }) => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.scope(userId) });
    },
  });
}

export function useUpsertMonthlySalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: MonthlySalaryPayload }) => {
      await requireIdentity(userId);
      return budgetApiService.upsertMonthlySalary(payload);
    },
    retry: false,
    onSuccess: async (_, { userId }) => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.scope(userId) });
    },
  });
}

export function useDeleteMonthlySalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: string }) => {
      await requireIdentity(userId);
      return budgetApiService.deleteMonthlySalary(payload);
    },
    retry: false,
    onSuccess: async (_, { userId }) => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.scope(userId) });
    },
  });
}

export function useDeleteBudgetEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: BudgetEntryDeletePayload;
    }) => {
      await requireIdentity(userId);
      return budgetApiService.deleteBudgetEntry(payload);
    },
    retry: false,
    onSuccess: async (_, { userId }) => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.scope(userId) });
    },
  });
}
