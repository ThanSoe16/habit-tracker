'use client';
import { useSettingsRouter } from '@/features/settings/use-unsaved-changes';

import { LogOut, Moon, ShieldCheck, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { DIGITAL_WELLBEING_ROUTES } from '../constants/routes';
import { useUserStore } from '@/store/use-user-store';
import { cn } from '@/utils/cn';

export function WellbeingSidebar() {
  const pathname = usePathname();
  const router = useSettingsRouter();
  const { setOpenMobile } = useSidebar();
  const { name, avatarEmoji, theme, setTheme } = useUserStore();

  const navigate = (href: string) => {
    router.push(href);
    setOpenMobile(false);
  };

  const setColorMode = (mode: 'light' | 'dark') => {
    setTheme(mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
      <SidebarHeader className="border-none bg-transparent p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30">
            <ShieldCheck />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Digital Wellbeing</h2>
            <p className="text-[10px] text-muted-foreground">Take back your attention</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto bg-transparent px-3 py-1">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-1 px-3 text-[11px] font-black tracking-wider text-muted-foreground">
            WELLBEING
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {DIGITAL_WELLBEING_ROUTES.map((item) => {
                const Icon = item.icon;
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      variant="primary"
                      isActive={active}
                      onClick={() => navigate(item.href)}
                      className={cn(
                        'w-full rounded px-3 py-5 text-xs font-bold transition-all duration-150',
                        active
                          ? 'font-extrabold shadow-2xs'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="flex flex-col gap-4 border-t border-sidebar-border bg-transparent p-4">
        <div className="flex items-center gap-1 rounded-full border border-border bg-muted p-1">
          <button
            type="button"
            onClick={() => setColorMode('light')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-bold transition-all',
              theme !== 'dark' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            <Sun className="size-3.5" /> Light
          </button>
          <button
            type="button"
            onClick={() => setColorMode('dark')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-bold transition-all',
              theme === 'dark'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground',
            )}
          >
            <Moon className="size-3.5" /> Dark
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-base">
              {avatarEmoji || '🧘'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-extrabold">{name || 'User'}</span>
              <span className="block truncate text-[10px] text-muted-foreground">
                Account & preferences
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Exit wellbeing"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
