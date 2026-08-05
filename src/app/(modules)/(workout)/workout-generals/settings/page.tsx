import GymSettingsPage from '@/components/pages/(workout)/generals/settings';
import { Suspense } from 'react';

export default function WorkoutTodayPageRoute() {
  return (
    <Suspense>
      <GymSettingsPage />
    </Suspense>
  );
}
