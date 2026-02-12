import { Suspense } from 'react';
import Home from '@/components/pages/home';

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  );
}
