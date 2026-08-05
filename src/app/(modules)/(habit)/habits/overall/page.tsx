import { Suspense } from 'react';
import HabitPage from '@/components/pages/(habit)/habits';

export default function HabitOverallPageRoute() {
  return (
    <Suspense>
      <HabitPage initialViewMode="overall" />
    </Suspense>
  );
}
