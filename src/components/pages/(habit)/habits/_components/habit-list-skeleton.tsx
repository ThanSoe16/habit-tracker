import { Skeleton } from '@/components/ui/skeleton';

export function HabitListSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-3">
      <span className="sr-only">Loading habits…</span>
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} aria-hidden="true" className="h-18 w-full rounded-2xl" />
      ))}
    </div>
  );
}
