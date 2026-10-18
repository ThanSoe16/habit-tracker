'use client';

import { useIsFetching } from '@tanstack/react-query';
import { LoadingStatus } from '@/components/shared/loading-status';

/** Keep fetch feedback visible even when a page's list footer is off screen. */
export function QueryLoadingIndicator() {
  const fetching = useIsFetching({ type: 'active' });
  if (!fetching) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end pb-18 justify-center">
      <LoadingStatus className="size-12 shrink-0 rounded-full border border-border bg-background shadow-sm" />
    </div>
  );
}
