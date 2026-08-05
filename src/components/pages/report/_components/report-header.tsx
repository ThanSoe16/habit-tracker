'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { SidebarDrawerModal } from '@/components/pages/home/_components/sidebar-drawer-modal';

export function ReportHeader() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-xs"
            title="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-black text-foreground">Analytics & Report</h1>
        </div>
      </div>

      <SidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentViewMode="today"
        onSelectViewMode={(mode) => router.push(`/${mode}`)}
      />
    </>
  );
}
