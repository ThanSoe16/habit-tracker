'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { hydrateNativeGoals } from '@/features/goals/services/native-hydration';
import { useNativeStatus } from '@/lib/native/status';

const accountKey = 'native-last-account';

export function NativeGoalsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let disposed = false;
    let activeId: string | null | undefined;
    let observed = false;
    const cached = z.string().uuid().safeParse(localStorage.getItem(accountKey));

    function selectAccount(userId: string | null) {
      if (disposed || activeId === userId) return;
      activeId = userId;
      if (userId) localStorage.setItem(accountKey, userId);
      else localStorage.removeItem(accountKey);
      void hydrateNativeGoals(userId).catch(() => {
        if (!disposed && activeId === userId) {
          useNativeStatus.setState({ loading: false, hydrationError: true });
        }
      });
    }

    // Only the last signed-in account is available offline; cloud sync still requires a session.
    if (!navigator.onLine && cached.success) selectAccount(cached.data);
    else {
      void supabase.auth
        .getSession()
        .then(({ data, error }) => {
          if (disposed || observed) return;
          selectAccount(data.session?.user.id ?? (error && cached.success ? cached.data : null));
        })
        .catch(() => {
          if (!disposed && !observed) selectAccount(cached.success ? cached.data : null);
        });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      observed = true;
      if (!session && event === 'INITIAL_SESSION' && !navigator.onLine && cached.success) return;
      selectAccount(session?.user.id ?? null);
    });
    return () => {
      disposed = true;
      subscription.unsubscribe();
    };
  }, []);
  return children;
}
