import { Suspense } from 'react';
import HomePage from '@/components/pages/home';

export default function HomeOverallPageRoute() {
  return (
    <Suspense>
      <HomePage initialViewMode="overall" />
    </Suspense>
  );
}
