'use client';

import { Timer } from 'lucide-react';
import { FloatingActionButton } from '@/components/shared/floating-action-button';

export function RestTimerFloatingButton({
  onClick,
  label = 'Rest',
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <FloatingActionButton onClick={onClick} aria-label="Open rest timer" aria-haspopup="dialog">
      <Timer className="size-5" />
      <span className="tabular-nums">{label}</span>
    </FloatingActionButton>
  );
}
