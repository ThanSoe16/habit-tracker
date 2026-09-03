'use client';

import { Menu, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HomeHeaderProps {
  greeting: string;
  name: string;
  avatarEmoji: string;
  formattedDate: string;
  onOpenSidebar?: () => void;
}

export function HomeHeader({ formattedDate, onOpenSidebar }: HomeHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex justify-between items-center px-1 py-1">
      {/* Menu Button */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

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
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-xs flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}
