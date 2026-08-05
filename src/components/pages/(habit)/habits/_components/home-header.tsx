'use client';

import { Menu, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface HomeHeaderProps {
  greeting: string;
  name: string;
  avatarEmoji: string;
  formattedDate: string;
  onOpenSidebar?: () => void;
}

export function HomeHeader({ formattedDate }: HomeHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex justify-between items-center px-1 py-1">
      {/* Shadcn Sidebar Trigger */}
      <SidebarTrigger className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors" />

      {/* Title */}
      <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
        {formattedDate || 'Today'}
      </h1>

      {/* Right Actions: Plus Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push('/managements/create')}
          title="Create Habit"
          className="w-10 h-10 rounded-full bg-blue-600 text-white shadow-xs flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}
