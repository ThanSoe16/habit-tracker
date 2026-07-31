import { Suspense } from 'react';
import HomePage from '@/components/pages/home';

export default function HomeTodayPageRoute() {
  return (
    <Suspense>
      <HomePage initialViewMode="today" />
    </Suspense>
  );
}
