'use client';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { digitalWellbeingService } from '../services/supabase';

export function useFocusHistory() {
  const userId = useQueryIdentity();
  const client = useQueryClient();
  useEffect(() => {
    const refresh = () => {
      void client.invalidateQueries({ queryKey: ['focus-history', userId] });
    };
    window.addEventListener('digital-wellbeing-change', refresh);
    return () => window.removeEventListener('digital-wellbeing-change', refresh);
  }, [client, userId]);
  return useInfiniteQuery({
    queryKey: ['focus-history', userId],
    enabled: Boolean(userId),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => digitalWellbeingService.focusPage(pageParam, signal),
    getNextPageParam: (page) => page.nextPage,
  });
}
