'use client';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { savingsKeys } from './query-keys';
import { savingsService } from './savings-service';

export function useSavingsBalances() {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: savingsKeys.balances(userId),
    enabled: Boolean(userId),
    retry: false,
    queryFn: ({ signal }) => savingsService.balances(userId!, signal),
  });
}

export function useSavings(page: number) {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: savingsKeys.list(userId, page),
    enabled: Boolean(userId),
    retry: false,
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

export function useInfiniteSavings(startPage = 1) {
  const userId = useQueryIdentity();
  return useInfiniteQuery({
    queryKey: ['savings', userId, 'infinite', startPage],
    enabled: Boolean(userId),
    initialPageParam: startPage,
    queryFn: ({ pageParam, signal }) => savingsService.list(userId!, pageParam, signal),
    getNextPageParam: (page, _pages, pageNumber) =>
      pageNumber * 10 < page.total ? pageNumber + 1 : undefined,
  });
}

export function useInfiniteSavingsHistory(id: string, startPage = 1) {
  const userId = useQueryIdentity();
  return useInfiniteQuery({
    queryKey: ['savings', userId, 'infinite-history', id, startPage],
    enabled: Boolean(userId && id),
    initialPageParam: startPage,
    queryFn: ({ pageParam, signal }) => savingsService.history(userId!, id, pageParam, signal),
    getNextPageParam: (page, _pages, pageNumber) =>
      pageNumber * 10 < page.total ? pageNumber + 1 : undefined,
  });
}
