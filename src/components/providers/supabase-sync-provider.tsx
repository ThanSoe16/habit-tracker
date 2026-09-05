'use client';

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
  { table: 'habits', sync: 'habits' },
  { table: 'custom_units', sync: 'habits' },
  { table: 'user_profiles', sync: 'user' },
  { table: 'mood_entries', sync: 'mood' },
  { table: 'media_items', sync: 'media' },
  { table: 'gym_plans', sync: 'gym' },
  { table: 'gym_custom_exercises', sync: 'gym' },
  { table: 'gym_body_metrics', sync: 'gym' },
  { table: 'workout_logs', sync: 'gym' },
  { table: 'current_budget', sync: 'budget' },
  { table: 'family_budgets', sync: 'budget' },
  { table: 'incomes', sync: 'budget' },
  { table: 'expenses', sync: 'budget' },
  { table: 'currency_exchanges', sync: 'budget' },
  { table: 'monthly_salary', sync: 'budget' },
  { table: 'budget_settings', sync: 'budget' },
  { table: 'loans', sync: 'budget' },
  { table: 'gold_holdings', sync: 'budget' },
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

    function syncForUser(userId: string) {
      if (syncedUserId === userId) return;
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
        if (cancelled) return;
        const user = data?.session?.user || null;

        if (user) {
          const nameFromMeta = user.user_metadata?.name || user.email?.split('@')[0];
          if (nameFromMeta) useUserStore.setState({ name: nameFromMeta });
          syncForUser(user.id);
        }
      } catch (error) {
        console.warn('Auth check error:', error);
      }
    }

    void checkAuthStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      if (user) {
        const nameFromMeta = user.user_metadata?.name || user.email?.split('@')[0];
        if (nameFromMeta) useUserStore.setState({ name: nameFromMeta });
        syncForUser(user.id);
      } else {
        clearUserSync();
      }
    });

    return () => {
      cancelled = true;
      clearUserSync();
      authListener.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
