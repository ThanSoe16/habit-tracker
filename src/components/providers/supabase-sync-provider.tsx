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
    // 1. Auth check & session listener
    async function checkAuthStatus() {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user || null;

      if (user) {
        setIsAuthenticated(true);
        const nameFromMeta = user.user_metadata?.name || user.email?.split('@')[0];
        if (nameFromMeta) setName(nameFromMeta);

        // If user is already logged in and attempts to access /login, redirect to /budget
        if (pathname === '/login' || pathname === '/auth/login') {
          router.replace('/budget');
        }
      } else {
        setIsAuthenticated(false);
        // If user is not logged in and attempts to access protected page, redirect to /login
        const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
        if (!isPublicPath) {
          router.replace('/login');
        }
      }
    }

    checkAuthStatus();

    // Subscribe to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      if (user) {
        setIsAuthenticated(true);
        const nameFromMeta = user.user_metadata?.name || user.email?.split('@')[0];
        if (nameFromMeta) setName(nameFromMeta);

        if (pathname === '/login' || pathname === '/auth/login') {
          router.replace('/budget');
        }
      } else {
        setIsAuthenticated(false);
        const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
        if (!isPublicPath) {
          router.replace('/login');
        }
      }
    });

    // 2. Data store sync
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

    // Subscribe to realtime database changes
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
  }, [pathname, router, setName]);

  return <>{children}</>;
}
