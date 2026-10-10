'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNativeStatus } from '@/lib/native/status';
import { hydrateNativeGoals } from '@/features/goals/services/native-hydration';
import { ReactQueryProvider } from './query-provider';

export function NativeAuthGuard({ children }: { children: React.ReactNode }) {
  const userId = useNativeStatus((state) => state.userId);
  const loading = useNativeStatus((state) => state.loading);
  const failed = useNativeStatus((state) => state.hydrationError);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!loading && !userId) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, userId, router, pathname]);

  if (failed && userId) {
    return (
      <main className="mx-auto flex max-w-lg flex-col gap-4 p-6">
        <p role="alert">Could not open your saved goals. Your stored data has been kept.</p>
        <Button onClick={() => void hydrateNativeGoals(userId)}>Retry</Button>
      </main>
    );
  }
  if (loading || !userId) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="animate-spin" aria-hidden="true" />
        <span className="sr-only">Opening your goals</span>
      </div>
    );
  }
  return (
    <ReactQueryProvider key={userId} userId={userId}>
      {children}
    </ReactQueryProvider>
  );
}
