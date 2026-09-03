'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const getPostLoginPath = () => {
  const requestedPath = new URLSearchParams(window.location.search).get('next');

  if (requestedPath && requestedPath.startsWith('/') && !requestedPath.startsWith('//')) {
    return requestedPath;
  }

  return '/habits/today';
};

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;

      if (error || !data.session) {
        router.replace('/login');
        return;
      }

      router.replace(getPostLoginPath());
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background text-primary"
      role="status"
    >
      <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
      <span className="sr-only">Completing sign in</span>
    </main>
  );
}
