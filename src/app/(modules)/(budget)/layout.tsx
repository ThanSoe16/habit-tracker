'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { BudgetAppSidebar } from '@/components/pages/(budget)/_components/budget-sidebar';
import { Wallet } from 'lucide-react';

export default function BudgetLayout({ children }: { children: React.ReactNode }) {
  const isSettings = usePathname().endsWith('/settings');
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <BudgetAppSidebar />
        <main className="flex-1 w-full overflow-x-hidden">
          <div
            className={cn(
              'w-full mx-auto px-4 pt-6 pb-28 space-y-5',
              isSettings ? 'max-w-2xl' : 'max-w-lg',
            )}
          >
            {/* Top Header */}
            <header className="flex justify-between items-center py-1">
              <SidebarTrigger className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-900 shadow-xs border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" />

              <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                {isSettings ? 'Budget settings' : 'Budget Tracker'}{' '}
                <Wallet className="w-5 h-5 text-primary" />
              </h1>

              <div className="w-10 h-10" />
            </header>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
