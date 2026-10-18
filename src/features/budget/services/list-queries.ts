'use client';
import { readActivityPage, type ActivityCursor } from './activity-pagination';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { useSyncIdentity } from '@/components/providers/supabase-sync-provider';
import { fetchBudgetPage } from '@/store/use-budget-store';
import { budgetSummaryService } from './summary-service';
import { budgetReadService, type BudgetReadGroup } from './budget-read-service';

export function useBudgetList(group: BudgetReadGroup, filters: Record<string, string> = {}) {
  const userId = useQueryIdentity();
  const ready = useSyncIdentity();
  const query = useInfiniteQuery({
    queryKey: ['budget', userId, 'pages', group, filters],
    enabled: Boolean(userId && ready === userId),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => fetchBudgetPage(group, pageParam, filters, signal),
    getNextPageParam: (page) => page.nextPage,
  });
  return {
    ...query,
    ids: new Set(query.data?.pages.flatMap((page) => page.ids)),
    total: query.data?.pages[0]?.total ?? 0,
  };
}

export function useGoldSummary() {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: ['budget', userId, 'summary', 'gold'],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => budgetSummaryService.gold(signal),
  });
}
export function useFamilySummary() {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: ['budget', userId, 'summary', 'family'],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => budgetSummaryService.family(signal),
  });
}
export function useBudgetExport(group: BudgetReadGroup, enabled: boolean) {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: ['budget', userId, 'export', group],
    enabled: Boolean(userId && enabled),
    queryFn: async () => {
      const result = await budgetReadService.fetchBudgetData([group]);
      if (!result) throw new Error('Could not load the full statement. Please retry.');
      return result;
    },
  });
}

export function useSalaryCount() {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: ['budget', userId, 'summary', 'salary'],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => budgetSummaryService.activeSalaries(signal),
  });
}

export function useBudgetActivity() {
  const userId = useQueryIdentity();
  const ready = useSyncIdentity();
  const query = useInfiniteQuery({
    queryKey: ['budget', userId, 'activity', 'pages'],
    enabled: Boolean(userId && ready === userId),
    initialPageParam: { page: 1 } as ActivityCursor,
    queryFn: ({ pageParam, signal }) =>
      readActivityPage(pageParam, (group, page) => fetchBudgetPage(group, page, {}, signal)),
    getNextPageParam: (page) => page.nextPage,
  });
  return {
    ...query,
    ids: new Set(query.data?.pages.flatMap((page) => page.ids)),
    visibleCount: (query.data?.pages.length ?? 1) * 10,
  };
}
