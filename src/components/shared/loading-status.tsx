'use client';

import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export function LoadingStatus({
  label = 'Loading…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn('flex items-center justify-center text-muted-foreground', className)}
    >
      <LoaderCircle className="size-5 shrink-0 motion-safe:animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
