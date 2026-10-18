'use client';
import { Button } from '@/components/ui/button';

export function QueryFeedback({
  query,
  label = 'data',
}: {
  query: {
    isPending: boolean;
    isError: boolean;
    isFetching: boolean;
    refetch: () => Promise<unknown>;
  };
  label?: string;
}) {
  // The shared query provider displays one centered loader for active requests.
  if (query.isFetching) return null;
  if (!query.isError) return null;
  return (
    <div role="alert" className="flex flex-col gap-2">
      <p className="text-sm text-destructive">Could not load {label}. Please retry.</p>
      <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>
        Retry
      </Button>
    </div>
  );
}
