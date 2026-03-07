'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { WeeklyHabitList } from '@/components/pages/home/_components/WeeklyHabitList';
import PageLayout from '@/components/layouts';

export default function WeeklyProgressPage() {
  const router = useRouter();

  return (
    <PageLayout>
      <div className="min-h-screen bg-background pb-12">
        <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-4 mb-6">
          <div className="flex items-center gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Weekly Progress</h1>
          </div>
        </div>

        <div className="px-4 max-w-2xl mx-auto">
          <WeeklyHabitList />
        </div>
      </div>
    </PageLayout>
  );
}
