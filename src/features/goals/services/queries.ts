'use client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { fetchGoalDetail, fetchGoalPage, useGoalsStore } from '../store/use-goals-store';
import { isNativeApp } from '@/lib/native/runtime';

export function useGoalList(completed = false, enabled = true) {
  const userId = useQueryIdentity();
  const ready = useGoalsStore((state) => state.ready);
  const goals = useGoalsStore((state) => state.goals);
  const query = useInfiniteQuery({
    queryKey: ['goals', userId, 'pages', completed],
    enabled: Boolean(!isNativeApp && userId && ready && enabled),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => fetchGoalPage(pageParam, completed, signal),
    getNextPageParam: (page) => page.nextPage,
  });
  const ids = new Set(query.data?.pages.flatMap((page) => page.ids));
  const byId = new Map(goals.map((goal) => [goal.id, goal]));
  const rows = (
    isNativeApp ? goals : [...ids].flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []))
  ).filter((goal) => (goal.status === 'completed') === completed);
  return {
    ...query,
    goals: rows,
    total: isNativeApp ? rows.length : (query.data?.pages[0]?.total ?? 0),
    hasNextPage: !isNativeApp && query.hasNextPage,
  };
}

export function useGoalDetail(id: string | null) {
  const userId = useQueryIdentity();
  const goal = useGoalsStore((state) => state.goals.find((row) => row.id === id));
  const ready = useGoalsStore((state) => state.ready);
  const query = useQuery({
    queryKey: ['goals', userId, 'detail', id],
    enabled: Boolean(!isNativeApp && userId && ready && id),
    queryFn: ({ signal }) => fetchGoalDetail(id!, signal),
  });
  return { ...query, goal };
}
