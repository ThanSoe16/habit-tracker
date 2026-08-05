'use client';

import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { HabitAppSidebar } from '@/components/pages/(habit)/habits/_components/habit-sidebar';

export default function HabitLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background dark:bg-zinc-950 text-foreground">
        <HabitAppSidebar />
        <main className="flex-1 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
