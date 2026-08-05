import { Suspense } from 'react';
import ManagementPage from '@/components/pages/(habit)/managements';

export default function OneTimeManagementRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background dark:bg-zinc-950 p-6 text-center text-sm font-bold text-gray-400">Loading...</div>}>
      <ManagementPage defaultTab="task" />
    </Suspense>
  );
}
