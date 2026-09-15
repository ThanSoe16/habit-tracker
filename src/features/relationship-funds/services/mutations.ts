'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FundTransactionInput } from '../types';
import { relationshipFundService } from './relationship-fund-service';
import { updateFundCache } from './update-fund-cache';
import { assertBudgetReadyForTransfer } from '@/store/use-budget-store';
import { DataRequestError } from '@/lib/supabase/request';

function assertReady() {
  try {
    assertBudgetReadyForTransfer();
  } catch {
    throw new DataRequestError(
      'Your budget is still syncing. Wait for it to finish, then try again.',
    );
  }
}

export function useSaveFundTransaction() {
  const client = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: ({
      userId,
      id,
      input,
      mode,
    }: {
      userId: string;
      id: string;
      input: FundTransactionInput;
      mode: 'create' | 'edit';
    }) => {
      assertReady();
      return relationshipFundService.save(userId, id, input, mode);
    },
    onSuccess: async (row, { userId }) => {
      await updateFundCache(client, userId, row);
    },
  });
}
export function useDeleteFundTransaction() {
  const client = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: ({ userId, id }: { userId: string; id: string }) => {
      assertReady();
      return relationshipFundService.remove(userId, id);
    },
    onSuccess: async (row, { userId }) => {
      await updateFundCache(client, userId, row, true);
    },
  });
}
