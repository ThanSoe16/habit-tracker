'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SavingsGoalInput, SavingsTransactionInput } from '../types';
import { savingsKeys } from './query-keys';
import { savingsService } from './savings-service';
import { updateSavingsCache } from './update-savings-cache';

export function useCreateSavings() {
  const client = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: ({
      userId,
      requestId,
      input,
    }: {
      userId: string;
      requestId: string;
      input: SavingsGoalInput;
    }) => savingsService.create(userId, requestId, input),
    onSuccess: async (goal, { userId }) => {
      client.setQueryData(savingsKeys.detail(userId, goal.id), goal);
      await client.invalidateQueries({ queryKey: savingsKeys.scope(userId) });
    },
  });
}
export function useRecordSavings() {
  const client = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: ({
      userId,
      requestId,
      input,
    }: {
      userId: string;
      requestId: string;
      input: SavingsTransactionInput;
    }) => savingsService.transact(userId, requestId, input),
    onSuccess: async (goal, { userId }) => {
      await updateSavingsCache(client, userId, goal);
    },
  });
}
