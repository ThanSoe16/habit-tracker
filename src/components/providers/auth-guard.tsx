'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const redirectToLogin = () => {
      const requestedPath = `${pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(requestedPath)}`);
    };

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;

      if (error || !data.session) {
        setHasSession(false);
        setIsChecking(false);
        redirectToLogin();
        return;
      }

      setHasSession(true);
      setIsChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      setHasSession(Boolean(session));
      setIsChecking(false);

      if (!session) redirectToLogin();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (isChecking || !hasSession) {
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

  return <>{children}</>;
}
