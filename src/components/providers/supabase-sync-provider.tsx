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

export function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let wellbeingRefreshTimer: number | undefined;
    let syncedUserId: string | null = null;
    let cancelled = false;

    async function syncAllStores() {
      try {
        await Promise.allSettled([
          useHabitStore.getState().fetchFromSupabase(),
          useUserStore.getState().fetchFromSupabase(),
          useMoodStore.getState().fetchFromSupabase(),
          useGymStore.getState().fetchFromSupabase(),
          useBudgetStore.getState().fetchFromSupabase(),
          useMediaStore.getState().fetchFromSupabase(),
          useDigitalWellbeingStore.getState().fetchFromSupabase(),
        ]);
      } catch (err) {
        console.warn('Error during Supabase synchronization:', err);
      }
    }

    function syncForUser(userId: string) {
      if (syncedUserId === userId) return;
      syncedUserId = userId;
      void syncAllStores();
    }

    // 1. Initial auth check
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
      } catch (err) {
        console.warn('Auth check error:', err);
      }
    }

    checkAuthStatus();

    // 2. Subscribe to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      if (user) {
        const nameFromMeta = user.user_metadata?.name || user.email?.split('@')[0];
        if (nameFromMeta) useUserStore.setState({ name: nameFromMeta });
        syncForUser(user.id);
      } else {
        syncedUserId = null;
      }
    });

    // 3. Subscribe to realtime database changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const table = payload.table;
        const isLegacyWellbeingTable =
          table === 'digital_wellbeing_profiles' ||
          table === 'social_media_sessions' ||
          table === 'social_media_urges';
        if (table.startsWith('digital_wellbeing_') || isLegacyWellbeingTable) {
          if (wellbeingRefreshTimer) window.clearTimeout(wellbeingRefreshTimer);
          wellbeingRefreshTimer = window.setTimeout(() => {
            if (table.startsWith('digital_wellbeing_')) {
              window.dispatchEvent(new Event('digital-wellbeing-change'));
            }
            if (isLegacyWellbeingTable) {
              void useDigitalWellbeingStore.getState().fetchFromSupabase();
            }
          }, 150);
          return;
        }
        if (table === 'habits' || table === 'custom_units') {
          useHabitStore.getState().fetchFromSupabase();
        } else if (table === 'user_profiles') {
          useUserStore.getState().fetchFromSupabase();
        } else if (table === 'mood_entries') {
          useMoodStore.getState().fetchFromSupabase();
        } else if (table === 'media_items') {
          useMediaStore.getState().fetchFromSupabase();
        } else if (
          table === 'gym_plans' ||
          table === 'gym_custom_exercises' ||
          table === 'gym_body_metrics' ||
          table === 'workout_logs'
        ) {
          useGymStore.getState().fetchFromSupabase();
        } else if (
          table === 'current_budget' ||
          table === 'family_budgets' ||
          table === 'incomes' ||
          table === 'expenses' ||
          table === 'currency_exchanges' ||
          table === 'monthly_salary' ||
          table === 'budget_settings' ||
          table === 'loans' ||
          table === 'budget_state'
        ) {
          useBudgetStore.getState().fetchFromSupabase();
        }
      })
      .subscribe();

    return () => {
      cancelled = true;
      if (wellbeingRefreshTimer) window.clearTimeout(wellbeingRefreshTimer);
      supabase.removeChannel(channel);
      authListener.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
