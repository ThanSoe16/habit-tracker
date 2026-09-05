import { BicepsFlexed, CircleX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { HabitKind } from '@/features/habits/types';

export function HabitDirectionBadge({ habitKind = 'build' }: { habitKind?: HabitKind }) {
  const isQuitHabit = habitKind === 'quit';
  const label = isQuitHabit ? 'Quit habit' : 'Build habit';

  return (
    <Badge
      variant={isQuitHabit ? 'destructive' : 'secondary'}
      className="size-5 p-0"
      aria-label={label}
      title={label}
    >
      {isQuitHabit ? (
        <CircleX aria-hidden="true" />
      ) : (
        <BicepsFlexed aria-hidden="true" />
      )}
    </Badge>
  );
}
