'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useQueryIdentity } from './query-provider';
import { useSyncIdentity } from './supabase-sync-provider';
import {
  routeSyncTargets,
  budgetGroupsForRoute,
  gymScopeForRoute,
  type LegacySyncTarget,
} from '@/features/sync/route-targets';
import { useUserStore } from '@/store/use-user-store';
import { useGymStore } from '@/store/use-gym-store';
import { useBudgetStore } from '@/store/use-budget-store';
import { prepareGoalsForPage, useGoalsStore } from '@/features/goals/store/use-goals-store';
import { activateGoalsSync } from '@/features/goals/store/goals-sync';
import { QueryFeedback } from '@/components/shared/infinite-list/query-feedback';
import { useSettingsSync } from '@/features/settings/sync-status';
import { requireIdentity } from '@/lib/supabase/require-identity';

const actions: Record<LegacySyncTarget, () => Promise<void>> = {
  user: () => useUserStore.getState().fetchFromSupabase(),
  gym: () => useGymStore.getState().fetchFromSupabase(),
  budget: () => useBudgetStore.getState().fetchFromSupabase(),
  goals: () => {
    activateGoalsSync();
    return prepareGoalsForPage();
  },
};

/** Legacy snapshots retain one owner and their existing write queues. Query caches
 * successful synchronization, not a second copy of those domain records. */
export function RouteSyncProvider({ children }: { children: React.ReactNode }) {
  const userId = useQueryIdentity();
  const readyUserId = useSyncIdentity();
  const pathname = usePathname();
  const client = useQueryClient();
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
      enabled: Boolean(userId && readyUserId === userId),
      queryFn: async () => {
        await requireIdentity(userId!);
        const scope = target === 'user' ? 'profile' : target === 'gym' ? 'workout' : target;
        const before = useSettingsSync.getState()[scope];
        if (target === 'gym')
          await useGymStore.getState().fetchFromSupabase(gymScopeForRoute(pathname));
        else if (target === 'budget')
          await useBudgetStore.getState().fetchFromSupabase(budgetGroupsForRoute(pathname));
        else if (target === 'goals' && pathname === '/goals/settings') {
          activateGoalsSync();
          await useGoalsStore.getState().fetchFromSupabase();
        } else await actions[target]();
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
  return (
    <>
      {queries.map((query, index) =>
        query.isError && !query.isFetching ? <QueryFeedback key={index} query={query} /> : null,
      )}
      {children}
    </>
  );
}
