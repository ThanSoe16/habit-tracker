import { Suspense } from 'react';

import HabitHistoryPage from '@/components/pages/(habit)/habits/history';

export default function HabitHistoryPageRoute() {
  return (
    <Suspense>
      <HabitHistoryPage />
    </Suspense>
  );
}
