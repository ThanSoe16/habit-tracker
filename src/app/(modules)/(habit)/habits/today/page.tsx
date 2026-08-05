import { Suspense } from 'react';
import HabitPage from '@/components/pages/(habit)/habits';

export default function HabitTodayPageRoute() {
  return (
    <Suspense>
      <HabitPage initialViewMode="today" />
    </Suspense>
  );
}
