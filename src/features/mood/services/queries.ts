'use client';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { requireIdentity } from '@/lib/supabase/require-identity';
import { moodService } from './supabase';
import type { MoodEntry } from '../types';

export function useMoodRange(from?: string, to?: string, enabled = true) {
  const userId = useQueryIdentity();
  const query = useQuery({
    queryKey: ['mood', userId, 'range', from, to],
    enabled: Boolean(userId && enabled),
    queryFn: ({ signal }) => moodService.fetchMoods(from, to, signal),
  });
  return {
    ...query,
    history: query.data ?? {},
    isLoaded: query.data !== undefined,
    isLoading: query.isFetching,
    error: query.isError ? 'Could not load moods. Please retry.' : null,
    fetchFromSupabase: query.refetch,
  };
}
export function useMoodDates() {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: ['mood', userId, 'dates'],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => moodService.dates(signal),
  });
}
export function useMoodList() {
  const userId = useQueryIdentity();
  return useInfiniteQuery({
    queryKey: ['mood', userId, 'infinite'],
    enabled: Boolean(userId),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => moodService.list(pageParam, signal),
    getNextPageParam: (page) => page.nextPage,
  });
}
export function useMoodActions() {
  const userId = useQueryIdentity();
  const client = useQueryClient();
  const save = useMutation({
    scope: { id: `mood-writes:${userId}` },
    mutationFn: async ({ date, entry }: { date: string; entry: MoodEntry }) => {
      await requireIdentity(userId!);
      return moodService.upsertMood(date, entry);
    },
    onSuccess: async (saved, { date }) => {
      await client.cancelQueries({ queryKey: ['mood', userId] });
      for (const [key, data] of client.getQueriesData<Record<string, MoodEntry>>({
        queryKey: ['mood', userId, 'range'],
      })) {
        const from = key[3] as string | undefined;
        const to = key[4] as string | undefined;
        if (data && (!from || date >= from) && (!to || date <= to))
          client.setQueryData(key, { ...data, [date]: saved });
      }
      await client.invalidateQueries({ queryKey: ['mood', userId] });
    },
  });
  const clear = useMutation({
    mutationFn: async () => {
      await requireIdentity(userId!);
      await moodService.deleteAllMoods();
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['mood', userId] }),
  });
  return {
    clearHistory: clear.mutateAsync,
    setMood: async (
      date: Date,
      mood: { label: string; emoji: string },
      tag?: string,
      note?: string,
    ) => {
      await save.mutateAsync({
        date: format(date, 'yyyy-MM-dd'),
        entry: {
          mood: mood.label,
          label: mood.label,
          emoji: mood.emoji,
          tag,
          note,
          timestamp: new Date().toISOString(),
        },
      });
    },
  };
}
