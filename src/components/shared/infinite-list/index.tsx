'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

type InfiniteListProps = {
  query: {
    hasNextPage: boolean;
    isFetching: boolean;
    isFetchingNextPage?: boolean;
    isError: boolean;
    fetchNextPage: () => Promise<unknown>;
    refetch: () => Promise<unknown>;
  };
};

/** Observes the actual scrolling ancestor, including drawers and nested lists. */
export function InfiniteListEnd({ query }: InfiniteListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetching, isError, fetchNextPage, refetch } = query;
  useEffect(() => {
    const element = ref.current;
    if (!element || !hasNextPage || isFetching || isError) return;
    let root = element.parentElement;
    while (
      root &&
      !(
        root.scrollHeight > root.clientHeight &&
        /auto|scroll/.test(getComputedStyle(root).overflowY)
      )
    ) {
      root = root.parentElement;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void fetchNextPage();
        }
      },
      { root, threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNextPage, isFetching, isError, fetchNextPage]);
  return (
    <>
      <div ref={ref} className="h-px" aria-hidden="true" />
      {isError && (
        <div role="alert">
          <p className="text-sm text-destructive">Could not load records. Please try again.</p>
          <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}
    </>
  );
}
