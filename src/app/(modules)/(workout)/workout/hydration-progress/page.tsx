import HydrationGoalProgressPage from '@/components/pages/(workout)/workouts/hydration-progress';
import { Suspense } from 'react';

export default function HydrationProgressPageRoute() {
  return (
    <Suspense>
      <HydrationGoalProgressPage />
    </Suspense>
  );
}
