'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { WorkoutAppSidebar } from '@/components/pages/(workout)/_components/workout-sidebar';
import { Dumbbell } from 'lucide-react';

export default function WorkoutLayout({ children }: { children: React.ReactNode }) {
  const isSettings = usePathname().endsWith('/settings');
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <WorkoutAppSidebar />
        <main className="flex-1 w-full overflow-x-hidden">
          <div
            className={cn(
              'w-full mx-auto px-4 pt-6 pb-28 space-y-5',
              isSettings ? 'max-w-2xl' : 'max-w-lg',
            )}
          >
            {/* Top Header matching Home Header layout */}
            <header className="flex justify-between items-center py-1">
              <SidebarTrigger className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors" />

              <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                {isSettings ? 'Workout settings' : 'Gym & Fitness Split'}{' '}
                <Dumbbell className="w-5 h-5 text-primary" />
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
