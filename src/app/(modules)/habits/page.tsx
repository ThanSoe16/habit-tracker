import { Suspense } from 'react';
import MyHabitsPage from '@/components/pages/habits';

export default function HabitsRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f7fd] dark:bg-zinc-950 p-6 text-center text-sm font-bold text-gray-400">Loading...</div>}>
      <MyHabitsPage />
    </Suspense>
  );
}
