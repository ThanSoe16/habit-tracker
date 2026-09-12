'use client';

import { useFocusSessionStore } from '@/features/wellbeing/store/use-focus-session-store';
import { partitionStore } from '@/lib/supabase/partition-store';
import { useSettingsSync } from '@/features/settings/sync-status';
import { partitionIdentityStores, setIdentityScope } from '@/lib/supabase/identity-scope';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useHabitStore } from '@/store/use-habit-store';
import { useUserStore } from '@/store/use-user-store';
import { useMoodStore } from '@/store/use-mood-store';
import { useGymStore } from '@/store/use-gym-store';
import { useBudgetStore } from '@/store/use-budget-store';
import { useMediaStore } from '@/store/use-media-store';
import { useDigitalWellbeingStore } from '@/store/use-digital-wellbeing-store';

type SyncTarget =
  | 'habits'
  | 'user'
  | 'mood'
  | 'media'
  | 'gym'
  | 'budget'
  | 'wellbeing-store'
  | 'wellbeing-event';

type RealtimeTarget = {
  table: string;
  sync: SyncTarget;
  userScoped?: boolean;
};

const REALTIME_TARGETS: RealtimeTarget[] = [
  { table: 'habits', sync: 'habits', userScoped: true },
  { table: 'custom_units', sync: 'habits', userScoped: true },
  { table: 'user_profiles', sync: 'user', userScoped: true },
  { table: 'mood_entries', sync: 'mood', userScoped: true },
  { table: 'media_items', sync: 'media', userScoped: true },
  { table: 'gym_plans', sync: 'gym', userScoped: true },
  { table: 'gym_custom_exercises', sync: 'gym', userScoped: true },
  { table: 'gym_body_metrics', sync: 'gym', userScoped: true },
  { table: 'workout_logs', sync: 'gym', userScoped: true },
  { table: 'current_budget', sync: 'budget', userScoped: true },
  { table: 'family_budgets', sync: 'budget', userScoped: true },
  { table: 'incomes', sync: 'budget', userScoped: true },
  { table: 'expenses', sync: 'budget', userScoped: true },
  { table: 'currency_exchanges', sync: 'budget', userScoped: true },
  { table: 'monthly_salary', sync: 'budget', userScoped: true },
  { table: 'budget_settings', sync: 'budget', userScoped: true },
  { table: 'loans', sync: 'budget', userScoped: true },
  { table: 'gold_holdings', sync: 'budget', userScoped: true },
  { table: 'digital_wellbeing_profiles', sync: 'wellbeing-store', userScoped: true },
  { table: 'social_media_sessions', sync: 'wellbeing-store', userScoped: true },
  { table: 'social_media_urges', sync: 'wellbeing-store', userScoped: true },
  { table: 'digital_wellbeing_daily_usage', sync: 'wellbeing-event', userScoped: true },
  { table: 'digital_wellbeing_app_usage', sync: 'wellbeing-event', userScoped: true },
  { table: 'digital_wellbeing_app_limits', sync: 'wellbeing-event', userScoped: true },
  { table: 'digital_wellbeing_focus_sessions', sync: 'wellbeing-event', userScoped: true },
  { table: 'digital_wellbeing_focus_session_apps', sync: 'wellbeing-event' },
  { table: 'digital_wellbeing_challenges', sync: 'wellbeing-event' },
  { table: 'digital_wellbeing_user_challenges', sync: 'wellbeing-event', userScoped: true },
  { table: 'digital_wellbeing_settings', sync: 'wellbeing-event', userScoped: true },
  { table: 'digital_wellbeing_bedtime_settings', sync: 'wellbeing-event', userScoped: true },
  { table: 'digital_wellbeing_insights', sync: 'wellbeing-event', userScoped: true },
];

const INITIAL_SYNCS = [
  ['habits', () => useHabitStore.getState().fetchFromSupabase()],
  ['user', () => useUserStore.getState().fetchFromSupabase()],
  ['mood', () => useMoodStore.getState().fetchFromSupabase()],
  ['gym', () => useGymStore.getState().fetchFromSupabase()],
  ['budget', () => useBudgetStore.getState().fetchFromSupabase()],
  ['media', () => useMediaStore.getState().fetchFromSupabase()],
  ['wellbeing', () => useDigitalWellbeingStore.getState().fetchFromSupabase()],
] as const;

export function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let syncedUserId: string | null = null;
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    let authObserved = false;
    const refreshTimers = new Map<SyncTarget, number>();

    const syncActions: Record<SyncTarget, () => void | Promise<void>> = {
      habits: () => useHabitStore.getState().fetchFromSupabase(),
      user: () => useUserStore.getState().fetchFromSupabase(),
      mood: () => useMoodStore.getState().fetchFromSupabase(),
      media: () => useMediaStore.getState().fetchFromSupabase(),
      gym: () => useGymStore.getState().fetchFromSupabase(),
      budget: () => useBudgetStore.getState().fetchFromSupabase(),
      'wellbeing-store': () => useDigitalWellbeingStore.getState().fetchFromSupabase(),
      'wellbeing-event': () => {
        window.dispatchEvent(new Event('digital-wellbeing-change'));
      },
    };

    function scheduleSync(target: SyncTarget) {
      const currentTimer = refreshTimers.get(target);
      if (currentTimer) window.clearTimeout(currentTimer);

      const timer = window.setTimeout(() => {
        refreshTimers.delete(target);
        Promise.resolve(syncActions[target]()).catch((error) => {
          console.warn(`Unable to refresh ${target} after realtime change:`, error);
        });
      }, 250);
      refreshTimers.set(target, timer);
    }

    async function syncAllStores() {
      await Promise.all(
        INITIAL_SYNCS.map(async ([name, sync]) => {
          try {
            await sync();
          } catch (error) {
            console.warn(`Unable to perform initial ${name} sync:`, error);
          }
        }),
      );
    }

    function startRealtimeSync(userId: string) {
      if (realtimeChannel) {
        void supabase.removeChannel(realtimeChannel);
      }

      let channel = supabase.channel(`user-db-changes:${userId}`);
      for (const target of REALTIME_TARGETS) {
        const config = {
          event: '*' as const,
          schema: 'public',
          table: target.table,
          ...(target.userScoped ? { filter: `user_id=eq.${userId}` } : {}),
        };
        channel = channel.on('postgres_changes', config, () => scheduleSync(target.sync));
      }

      realtimeChannel = channel.subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`Realtime synchronization channel status: ${status}`);
        }
      });
    }

    function partitionAccounts(userId: string | null) {
      setIdentityScope(userId);
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker.ready
          .then((registration) => {
            // Read the latest identity when the worker becomes ready, including logout.
            registration.active?.postMessage({ type: 'ACCOUNT_CHANGED', userId: syncedUserId });
          })
          .catch(() => undefined);
      }
      partitionIdentityStores(() => {
        useHabitStore.setState(useHabitStore.getInitialState(), true);
        useUserStore.setState(useUserStore.getInitialState(), true);
        useMoodStore.setState(useMoodStore.getInitialState(), true);
        useGymStore.setState(useGymStore.getInitialState(), true);
        useSettingsSync.setState(useSettingsSync.getInitialState(), true);
        void partitionStore(useBudgetStore, `budget:${userId ?? 'signed-out'}`, Boolean(userId));
        void partitionStore(useMediaStore, `media:${userId ?? 'signed-out'}`, Boolean(userId));
      });
      // Preserve old/unassigned storage. Never import another account's pending data.
      void partitionStore(
        useDigitalWellbeingStore,
        `digital-wellbeing:${userId ?? 'signed-out'}`,
        Boolean(userId),
      );
      void partitionStore(
        useFocusSessionStore,
        `focus-session:${userId ?? 'signed-out'}`,
        Boolean(userId),
      );
    }

    function syncForUser(userId: string) {
      if (syncedUserId === userId) return;
      clearUserSync();
      partitionAccounts(userId);
      syncedUserId = userId;
      startRealtimeSync(userId);
      void syncAllStores();
    }

    function clearUserSync() {
      syncedUserId = null;
      if (realtimeChannel) {
        void supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
      refreshTimers.forEach((timer) => window.clearTimeout(timer));
      refreshTimers.clear();
    }

    async function checkAuthStatus() {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled || authObserved) return;
        const user = data?.session?.user || null;

        if (user) {
          syncForUser(user.id);
        }
      } catch (error) {
        console.warn('Auth check error:', error);
      }
    }

    void checkAuthStatus();
    const mediaRefresh = window.setInterval(
      () => {
        if (syncedUserId) {
          scheduleSync('media');
          scheduleSync('gym');
          scheduleSync('user');
        }
      },
      30 * 60 * 1000,
    );

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      authObserved = true;
      const user = session?.user || null;
      if (user) {
        syncForUser(user.id);
      } else {
        partitionAccounts(null);
        clearUserSync();
      }
    });

    return () => {
      cancelled = true;
      window.clearInterval(mediaRefresh);
      clearUserSync();
      authListener.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
