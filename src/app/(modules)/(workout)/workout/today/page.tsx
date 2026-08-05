import GymPage from '@/components/pages/(workout)/workouts';
import { Suspense } from 'react';

export default function WorkoutTodayPageRoute() {
  return (
    <Suspense>
      <GymPage />
    </Suspense>
  );
}
