import GymBodyMetricsHistoryPage from '@/components/pages/(workout)/workouts/personal-info-history';
import { Suspense } from 'react';

export default function WorkoutTodayPageRoute() {
  return (
    <Suspense>
      <GymBodyMetricsHistoryPage />
    </Suspense>
  );
}
