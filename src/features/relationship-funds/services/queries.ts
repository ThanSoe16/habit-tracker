'use client';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { fundKeys } from './query-keys';
import { relationshipFundService } from './relationship-fund-service';

export function useFundMonth(
  month: string | null,
  person: 'ALL' | 'TSO' | 'Nway' = 'ALL',
  enabled = true,
) {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: fundKeys.month(userId, month, person),
    enabled: Boolean(userId && enabled),
    retry: false,
    queryFn: ({ signal }) => relationshipFundService.month(userId!, month, signal, person),
  });
}

export function useFundSummary(person: 'ALL' | 'TSO' | 'Nway' = 'ALL') {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: [...fundKeys.scope(userId), 'summary', person],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => relationshipFundService.summary(userId!, person, signal),
  });
}
export function useFundList(person: 'ALL' | 'TSO' | 'Nway', startPage: number) {
  const userId = useQueryIdentity();
  return useInfiniteQuery({
    queryKey: [...fundKeys.scope(userId), 'infinite', person, startPage],
    enabled: Boolean(userId),
    initialPageParam: startPage,
    queryFn: ({ pageParam, signal }) =>
      relationshipFundService.list(userId!, pageParam, person, signal),
    getNextPageParam: (page) => page.nextPage,
  });
}
