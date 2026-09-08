'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { ReactQueryProvider } from './query-provider';
import { supabase } from '@/lib/supabase/client';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let authObserved = false;

    const redirectToLogin = () => {
      const requestedPath = `${pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(requestedPath)}`);
    };

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted || authObserved) return;

        if (error || !data.session) {
          setUserId(null);
          setIsChecking(false);
          redirectToLogin();
          return;
        }

        setUserId(data.session.user.id);
        setIsChecking(false);
      })
      .catch(() => {
        if (!isMounted || authObserved) return;
        setUserId(null);
        setIsChecking(false);
        redirectToLogin();
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      authObserved = true;

      setUserId(session?.user.id ?? null);
      setIsChecking(false);

      if (!session) redirectToLogin();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (isChecking || !userId) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background text-primary"
        role="status"
      >
        <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }

  return (
    <ReactQueryProvider key={userId} userId={userId}>
      {children}
    </ReactQueryProvider>
  );
}
