import { Suspense } from 'react';
import ReportPage from '@/components/pages/(habit)/generals/reports';

export default function GeneralReportsRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background dark:bg-zinc-950 p-6 text-center text-sm font-bold text-gray-400">Loading...</div>}>
      <ReportPage />
    </Suspense>
  );
}
