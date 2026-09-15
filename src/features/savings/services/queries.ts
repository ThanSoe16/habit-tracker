'use client';
import { useQuery } from '@tanstack/react-query';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { savingsKeys } from './query-keys';
import { savingsService } from './savings-service';

export function useSavingsBalances() {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: savingsKeys.balances(userId),
    enabled: Boolean(userId),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    queryFn: ({ signal }) => savingsService.balances(userId!, signal),
  });
}

export function useSavings(page: number) {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: savingsKeys.list(userId, page),
    enabled: Boolean(userId),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    queryFn: ({ signal }) => savingsService.list(userId!, page, signal),
  });
}
export function useSavingsHistory(id: string, page: number) {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: savingsKeys.history(userId, id, page),
    enabled: Boolean(userId && id),
    retry: false,
    queryFn: ({ signal }) => savingsService.history(userId!, id, page, signal),
  });
}
