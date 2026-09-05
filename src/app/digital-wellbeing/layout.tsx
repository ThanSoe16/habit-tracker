'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/providers/auth-guard';
import { BottomNav } from '@/components/layouts/bottom-nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { WellbeingPageHeader } from '@/features/wellbeing/components/wellbeing-page-header';
import { WellbeingSidebar } from '@/features/wellbeing/components/wellbeing-sidebar';

export default function DigitalWellbeingLayout({ children }: { children: ReactNode }) {
  const isSettings = usePathname().endsWith('/settings');
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <WellbeingSidebar />
          <main className="w-full flex-1 overflow-x-hidden">
            <div
              className={cn(
                'mx-auto flex w-full flex-col gap-5 px-4 pb-28 pt-6',
                isSettings ? 'max-w-2xl' : 'max-w-lg',
              )}
            >
              <WellbeingPageHeader />
              {children}
            </div>
          </main>
          <BottomNav />
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
