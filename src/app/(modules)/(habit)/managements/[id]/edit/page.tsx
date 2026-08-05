import { Suspense, use } from 'react';
import EditHabitPage from '@/components/pages/(habit)/managements/detail/edit';

export default function EditHabitRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-background dark:bg-zinc-950 p-6 text-center text-sm font-bold text-gray-400">Loading...</div>}>
      <EditHabitPage id={id} />
    </Suspense>
  );
}
