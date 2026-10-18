'use client';
import { filterHabits, type HabitListFilter } from '../utils/filter-habits';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { habitsService } from './supabase';
import { habitKeys } from './query-keys';

export function useHabitList(type?: 'habit' | 'task') {
  const userId = useQueryIdentity();
  const query = useInfiniteQuery({
    queryKey: ['habits', userId, 'infinite', type ?? 'all'],
    enabled: Boolean(userId),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => habitsService.list(pageParam, signal, type),
    getNextPageParam: (page) => page.nextPage,
  });
  return {
    ...query,
    habits: query.data?.pages.flatMap((page) => page.rows) ?? [],
    isLoaded: !query.isPending,
    loadError: query.isError ? 'Could not load habits. Please retry.' : null,
  };
}

export function useHabitDetail(id: string) {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: habitKeys.detail(userId, id),
    enabled: Boolean(userId && id),
    queryFn: ({ signal }) => habitsService.detail(id, signal),
  });
}

export function useHabitSummary(dates: string[], remindersOnly = false) {
  const userId = useQueryIdentity();
  const query = useQuery({
    queryKey: ['habits', userId, 'summary', dates, remindersOnly],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => habitsService.summary(dates, remindersOnly, signal),
  });
  return {
    ...query,
    habits: query.data ?? [],
    isLoaded: !query.isPending,
    loadError: query.isError ? 'Could not load habits.' : null,
  };
}

export function useHabitReport() {
  const userId = useQueryIdentity();
  const query = useQuery({
    queryKey: ['habits', userId, 'report'],
    enabled: Boolean(userId),
    queryFn: async () => {
      const rows = await habitsService.fetchHabits();
      if (!rows) throw new Error('Could not load your habits.');
      return rows;
    },
  });
  return {
    ...query,
    habits: query.data ?? [],
    isLoaded: !query.isPending,
    loadError: query.isError ? 'Could not load habits.' : null,
  };
}

export function useTodayHabits(filters: HabitListFilter) {
  const userId = useQueryIdentity();
  const summary = useHabitSummary([filters.date]);
  const ids = filterHabits(summary.habits, filters).map((habit) => habit.id);
  const query = useInfiniteQuery({
    queryKey: ['habits', userId, 'infinite', filters, ids],
    enabled: Boolean(userId && summary.data),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => habitsService.listSelected(ids, pageParam, signal),
    getNextPageParam: (page) => page.nextPage,
  });
  return {
    ...query,
    isError: query.isError || summary.isError,
    isFetching: query.isFetching || summary.isFetching,
    refetch: async () => {
      await summary.refetch();
      return query.refetch();
    },
    habits: query.data?.pages.flatMap((page) => page.rows) ?? [],
    isLoaded: !summary.isPending && !query.isPending,
  };
}
