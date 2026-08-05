import { PlanEditor } from '@/components/pages/(workout)/managements/plan';
import { Suspense } from 'react';

export default function WorkoutTodayPageRoute() {
  return (
    <Suspense>
      <PlanEditor />
    </Suspense>
  );
}
