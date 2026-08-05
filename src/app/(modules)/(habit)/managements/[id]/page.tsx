import { Suspense, use } from 'react';
import HabitDetailPage from '@/components/pages/(habit)/managements/detail';

export default function HabitDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-background dark:bg-zinc-950 p-6 text-center text-sm font-bold text-gray-400">Loading...</div>}>
      <HabitDetailPage id={id} />
    </Suspense>
  );
}
