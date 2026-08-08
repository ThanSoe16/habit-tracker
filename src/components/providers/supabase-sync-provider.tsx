'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useHabitStore } from '@/store/use-habit-store';
import { useUserStore } from '@/store/use-user-store';
import { useMoodStore } from '@/store/use-mood-store';
import { useGymStore } from '@/store/use-gym-store';
import { useBudgetStore } from '@/store/use-budget-store';

const PUBLIC_PATHS = ['/login', '/auth/login', '/manifest.json', '/favicon.ico', '/sw.js'];

export function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  const [synced, setSynced] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { setName } = useUserStore();

  useEffect(() => {
    // 1. Initial auth check
    async function checkAuthStatus() {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user || null;

        if (user) {
          setIsAuthenticated(true);
          const nameFromMeta = user.user_metadata?.name || user.email?.split('@')[0];
          if (nameFromMeta) setName(nameFromMeta);
        } else {
          setIsAuthenticated(false);
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
        setIsAuthenticated(true);
        const nameFromMeta = user.user_metadata?.name || user.email?.split('@')[0];
        if (nameFromMeta) setName(nameFromMeta);
      } else {
        setIsAuthenticated(false);
      }
    });

    // 3. Data store sync
    async function syncAllStores() {
      try {
        await Promise.allSettled([
          useHabitStore.getState().fetchFromSupabase(),
          useUserStore.getState().fetchFromSupabase(),
          useMoodStore.getState().fetchFromSupabase(),
          useGymStore.getState().fetchFromSupabase(),
          useBudgetStore.getState().fetchFromSupabase(),
        ]);
      } catch (err) {
        console.warn('Error during Supabase synchronization:', err);
      } finally {
        setSynced(true);
      }
    }

    syncAllStores();

    // 4. Subscribe to realtime database changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          const table = payload.table;
          if (table === 'habits' || table === 'custom_units') {
            useHabitStore.getState().fetchFromSupabase();
          } else if (table === 'user_profiles') {
            useUserStore.getState().fetchFromSupabase();
          } else if (table === 'mood_entries') {
            useMoodStore.getState().fetchFromSupabase();
          } else if (table === 'gym_plans' || table === 'gym_custom_exercises' || table === 'workout_logs') {
            useGymStore.getState().fetchFromSupabase();
          } else if (
            table === 'current_budget' ||
            table === 'family_budgets' ||
            table === 'incomes' ||
            table === 'expenses' ||
            table === 'monthly_salary' ||
            table === 'budget_settings' ||
            table === 'loans' ||
            table === 'budget_state'
          ) {
            useBudgetStore.getState().fetchFromSupabase();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      authListener.subscription.unsubscribe();
    };
  }, [setName]);

  return <>{children}</>;
}
