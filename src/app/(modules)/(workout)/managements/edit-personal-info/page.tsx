import GymProfilePage from '@/components/pages/(workout)/workouts/personal-info';
import { Suspense } from 'react';

export default function WorkoutTodayPageRoute() {
  return (
    <Suspense>
      <GymProfilePage />
    </Suspense>
  );
}
