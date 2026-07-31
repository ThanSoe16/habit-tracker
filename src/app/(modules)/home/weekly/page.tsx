import { Suspense } from 'react';
import HomePage from '@/components/pages/home';

export default function HomeWeeklyPageRoute() {
  return (
    <Suspense>
      <HomePage initialViewMode="weekly" />
    </Suspense>
  );
}
