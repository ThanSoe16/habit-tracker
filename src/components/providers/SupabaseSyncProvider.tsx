'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useHabitStore } from '@/store/useHabitStore';
import { useUserStore } from '@/store/useUserStore';
import { useMoodStore } from '@/store/useMoodStore';
import { useGymStore } from '@/store/useGymStore';

export function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    async function syncAllStores() {
      try {
        await Promise.allSettled([
          useHabitStore.getState().fetchFromSupabase(),
          useUserStore.getState().fetchFromSupabase(),
          useMoodStore.getState().fetchFromSupabase(),
          useGymStore.getState().fetchFromSupabase(),
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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <>{children}</>;
}
