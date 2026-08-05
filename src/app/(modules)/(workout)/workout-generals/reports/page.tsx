import GymReportsPage from '@/components/pages/(workout)/generals/reports';
import { Suspense } from 'react';

export default function WorkoutTodayPageRoute() {
  return (
    <Suspense>
      <GymReportsPage />
    </Suspense>
  );
}
