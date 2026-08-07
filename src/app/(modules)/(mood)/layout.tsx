'use client';

import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MoodAppSidebar } from '@/components/pages/(mood)/_components/mood-sidebar';
import { Smile } from 'lucide-react';

export default function MoodLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background dark:bg-zinc-950 text-foreground">
        <MoodAppSidebar />
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-28 space-y-5">
            {/* Top Header matching Workout & Home Header layout */}
            <header className="flex justify-between items-center py-1">
              <SidebarTrigger className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors" />

              <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                Mood & Wellness Stat <Smile className="w-5 h-5 text-indigo-600 animate-pulse" />
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
