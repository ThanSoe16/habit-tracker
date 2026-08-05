'use client';

import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { WorkoutAppSidebar } from '@/components/pages/(workout)/_components/workout-sidebar';

export default function WorkoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background dark:bg-zinc-950 text-foreground">
        <WorkoutAppSidebar />
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>
      </div>
    </SidebarProvider>
  );
}
