'use client';
import { useQuery } from '@tanstack/react-query';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { fundKeys } from './query-keys';
import { relationshipFundService } from './relationship-fund-service';

export function useFundMonth(month: string | null, person: 'ALL' | 'TSO' | 'Nway' = 'ALL') {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: fundKeys.month(userId, month, person),
    enabled: Boolean(userId),
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: ({ signal }) => relationshipFundService.month(userId!, month, signal, person),
  });
}
