'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, History } from 'lucide-react';

interface MoodHeaderProps {
  onOpenSidebar?: () => void;
}

export function MoodHeader({ onOpenSidebar }: MoodHeaderProps) {
  return (
    <header className="flex justify-between items-center py-1">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
        title="Open Mood Navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
        Mood Stat
      </h1>

      <Link
        href="/mood/history"
        className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
        title="Mood History"
      >
        <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </Link>
    </header>
  );
}
