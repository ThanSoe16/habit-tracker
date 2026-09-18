'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FundTransactionInput } from '../types';
import { relationshipFundService } from './relationship-fund-service';
import { updateFundCache } from './update-fund-cache';
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
      return relationshipFundService.remove(userId, id);
    },
    onSuccess: async (row, { userId }) => {
      await updateFundCache(client, userId, row, true);
    },
  });
}
