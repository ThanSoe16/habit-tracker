import { Suspense } from 'react';
import CreateHabitPage from '@/components/pages/(habit)/managements/create';

export default function CreateHabitRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background dark:bg-zinc-950 p-6 text-center text-sm font-bold text-gray-400">Loading...</div>}>
      <CreateHabitPage />
    </Suspense>
  );
}
