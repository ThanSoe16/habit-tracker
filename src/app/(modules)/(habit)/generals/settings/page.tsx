import { Suspense } from 'react';
import SettingsPage from '@/components/pages/(habit)/generals/settings';

export default function GeneralSettingsRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background dark:bg-zinc-950 p-6 text-center text-sm font-bold text-gray-400">Loading...</div>}>
      <SettingsPage />
    </Suspense>
  );
}
