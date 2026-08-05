import { Suspense } from 'react';
import HabitPage from '@/components/pages/(habit)/habits';

export default function HabitWeeklyPageRoute() {
  return (
    <Suspense>
      <HabitPage initialViewMode="weekly" />
    </Suspense>
  );
}
