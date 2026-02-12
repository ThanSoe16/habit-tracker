'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { OverallHabitList } from '@/components/pages/home/_components/OverallHabitList';

export default function OverallProgressPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 mb-6">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Overall Progress</h1>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto">
        <OverallHabitList />
      </div>
    </div>
  );
}
