'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryIdentity } from './query-provider';
import { useSyncIdentity } from './supabase-sync-provider';
import {
  routeSyncTargets,
  routeStoreTargets,
  budgetGroupsForRoute,
  gymScopeForRoute,
} from '@/features/sync/route-targets';
import { routeStores } from '@/features/sync/route-stores';
import { useUserStore } from '@/store/use-user-store';
import { QueryFeedback } from '@/components/shared/infinite-list/query-feedback';
import { LoadingStatus } from '@/components/shared/loading-status';
import { useSettingsSync } from '@/features/settings/sync-status';
import { requireIdentity } from '@/lib/supabase/require-identity';

/** Legacy snapshots retain one owner and their existing write queues. Query caches
 * successful synchronization, not a second copy of those domain records. */
export function RouteSyncProvider({ children }: { children: React.ReactNode }) {
  const userId = useQueryIdentity();
  const readyUserId = useSyncIdentity();
  const pathname = usePathname();
  const client = useQueryClient();
  const targets = routeStoreTargets(pathname);
  const accountReady = Boolean(userId && readyUserId === userId);
  const stores = useQuery({
    queryKey: ['route-stores', userId, targets],
    enabled: accountReady && targets.length > 0,
    staleTime: Infinity,
    queryFn: async () => {
      await routeStores.prepare(targets, userId!);
      await requireIdentity(userId!);
      return true;
    },
  });
  const storesReady = targets.length === 0 || stores.isSuccess;
  const queries = useQueries({
    queries: routeSyncTargets(pathname).map((target) => ({
      queryKey: [
        'legacy-sync',
        userId,
        target,
        target === 'gym'
          ? gymScopeForRoute(pathname)
          : target === 'budget'
            ? budgetGroupsForRoute(pathname)
            : target === 'goals'
              ? pathname === '/goals/settings'
              : null,
      ],
      enabled: accountReady && (target === 'user' || storesReady),
      queryFn: async () => {
        await requireIdentity(userId!);
        const scope = target === 'user' ? 'profile' : target === 'gym' ? 'workout' : target;
        const before = useSettingsSync.getState()[scope];
        if (target === 'gym') {
          const { useGymStore } = await import('@/store/use-gym-store');
          await requireIdentity(userId!);
          await useGymStore.getState().fetchFromSupabase(gymScopeForRoute(pathname));
        } else if (target === 'budget') {
          const { useBudgetStore } = await import('@/store/use-budget-store');
          await requireIdentity(userId!);
          await useBudgetStore.getState().fetchFromSupabase(budgetGroupsForRoute(pathname));
        } else if (target === 'goals') {
          const { prepareGoalsForPage, useGoalsStore } =
            await import('@/features/goals/store/use-goals-store');
          const { activateGoalsSync } = await import('@/features/goals/store/goals-sync');
          await requireIdentity(userId!);
          activateGoalsSync();
          if (pathname === '/goals/settings') await useGoalsStore.getState().fetchFromSupabase();
          else await prepareGoalsForPage();
        } else await useUserStore.getState().fetchFromSupabase();
        const after = useSettingsSync.getState()[scope];
        if (after !== before && after.status === 'error')
          throw new Error(after.error ?? 'Could not load data.');
        return true;
      },
    })),
  });
  useEffect(() => {
    const onChange = (event: Event) => {
      const target = (event as CustomEvent<string>).detail;
      const feature = target === 'wellbeing-store' ? 'wellbeing' : target;
      void client.invalidateQueries({ queryKey: ['legacy-sync', userId, feature] });
      void client.invalidateQueries({ queryKey: [feature, userId] });
    };
    window.addEventListener('server-data-change', onChange);
    return () => window.removeEventListener('server-data-change', onChange);
  }, [client, userId]);
  if (!accountReady || !storesReady) {
    return stores.isError ? (
      <QueryFeedback query={stores} />
    ) : (
      <LoadingStatus label="Opening your data…" className="min-h-screen" />
    );
  }
  return (
    <>
      {queries.map((query, index) =>
        query.isError && !query.isFetching ? <QueryFeedback key={index} query={query} /> : null,
      )}
      {children}
    </>
  );
}
