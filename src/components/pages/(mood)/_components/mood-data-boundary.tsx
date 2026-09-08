'use client';

import { useEffect, type ReactNode } from 'react';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMoodStore } from '@/store/use-mood-store';

export function MoodDataBoundary({ children }: { children: ReactNode }) {
  const { isLoaded, isLoading, error, fetchFromSupabase } = useMoodStore();

  useEffect(() => {
    const state = useMoodStore.getState();
    if (!state.isLoaded && !state.isLoading && !state.error) void fetchFromSupabase();
  }, [fetchFromSupabase]);

  if (!isLoaded && !error) {
    return <Skeleton className="h-96 w-full rounded-3xl" aria-label="Loading mood history" />;
  }

  return (
    <Flex className="flex flex-col gap-4">
      {error && (
        <Card>
          <CardContent className="flex flex-col items-start gap-3">
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
            <Button variant="outline" disabled={isLoading} onClick={() => void fetchFromSupabase()}>
              {isLoading ? 'Retrying…' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      )}
      {isLoaded && children}
    </Flex>
  );
}
