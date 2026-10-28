'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useSettingsSync } from '@/features/settings/sync-status';
import { useGoalsStore } from '@/features/goals/store/use-goals-store';
import { cn } from '@/utils/cn';
import { GoalsAppSidebar } from './goals-sidebar';
import { isNativeApp } from '@/lib/native/runtime';
import { NativeSyncControl } from './native-sync-control';
import { SettingsPageHeader } from '@/components/shared/settings/settings-page-header';

function getHeader(pathname: string) {
  if (pathname.startsWith('/goals/manage')) {
    return { title: 'Goal list', description: 'Review and update your active goals.' };
  }
  if (pathname.startsWith('/goals/create')) {
    return { title: 'Create goal', description: 'Capture a goal, target date, money, and ideas.' };
  }
  if (pathname.startsWith('/goals/history')) {
    return { title: 'Goal history', description: 'Completed goals and notes.' };
  }
  if (pathname.startsWith('/goals/settings')) {
    return { title: 'Goal settings', description: 'Small preferences for this section.' };
  }
  return { title: 'Wishes', description: '' };
}

export function GoalsShell({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const goalsSync = useSettingsSync((state) => state.goals);
  const goalsReady = useGoalsStore((state) => state.ready);
  const header = getHeader(pathname);
  const showCreateAction = !pathname.startsWith('/goals/create');
  const isHome = pathname === '/goals';
  const isSettings = pathname.startsWith('/goals/settings');
  const hasPageHeader =
    pathname.startsWith('/goals/manage') || pathname.startsWith('/goals/create');

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {sidebar ?? <GoalsAppSidebar />}
        <main className="w-full flex-1 overflow-x-hidden">
          <div
            className={cn(
              'mx-auto flex min-h-screen w-full flex-col px-4 pb-32',
              isSettings ? 'max-w-2xl gap-6 pt-6' : 'max-w-lg gap-3 pt-4',
            )}
          >
            {isSettings ? (
              <SettingsPageHeader
                title="Goal settings"
                description="Personalize your Goals home and manage completed goals."
                navigation={
                  <SidebarTrigger className="size-10 rounded-xl border border-border bg-card shadow-xs" />
                }
              />
            ) : (
              !hasPageHeader && (
                <header className="flex items-center justify-between px-1 py-1">
                  <SidebarTrigger
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full text-foreground',
                      !isHome && 'border border-border bg-card shadow-xs',
                    )}
                  />
                  <div className="min-w-0 text-center">
                    <h1
                      className={cn(
                        'text-lg text-foreground',
                        isHome ? 'font-semibold' : 'font-black tracking-tight',
                      )}
                    >
                      {header.title}
                    </h1>
                    {header.description && (
                      <p className="max-w-56 truncate text-xs font-medium text-muted-foreground">
                        {header.description}
                      </p>
                    )}
                  </div>
                  {showCreateAction ? (
                    <Button
                      type="button"
                      onClick={() => router.push('/goals/create')}
                      title="Create goal"
                      aria-label="Create goal"
                      variant={isHome ? 'ghost' : 'default'}
                      size="icon-lg"
                      className="size-10 rounded-full"
                    >
                      <Plus className="size-5" strokeWidth={2.5} />
                    </Button>
                  ) : (
                    <div className="size-10" aria-hidden="true" />
                  )}
                </header>
              )
            )}

            {isNativeApp && <NativeSyncControl />}
            {!isNativeApp && goalsSync.status === 'error' && (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive"
              >
                <span>{goalsSync.error}</span>
                <Button type="button" size="sm" variant="outline" onClick={goalsSync.retry}>
                  Retry
                </Button>
              </div>
            )}
            {goalsReady ? (
              children
            ) : (
              <p role="status" className="px-1 py-8 text-sm text-muted-foreground">
                Loading goals...
              </p>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
