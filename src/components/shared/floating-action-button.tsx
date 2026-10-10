'use client';

import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export function FloatingActionButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      className={cn(
        'fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-6 z-40 h-14 gap-2 rounded-full border-2 border-background px-5 font-bold shadow-lg shadow-primary/25',
        className,
      )}
      {...props}
    />
  );
}
