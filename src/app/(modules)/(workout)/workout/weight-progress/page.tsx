import WeightGoalProgressPage from '@/components/pages/(workout)/workouts/weight-progress';
import { Suspense } from 'react';

export default function WeightProgressPageRoute() {
  return (
    <Suspense>
      <WeightGoalProgressPage />
    </Suspense>
  );
}
