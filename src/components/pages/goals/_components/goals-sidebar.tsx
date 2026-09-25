'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Clock3, Flag, Home, ListChecks, Moon, Plus, Settings, Sun } from 'lucide-react';
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
import { LogoutButton } from '@/components/shared/buttons/logout-button';
import { useUserStore } from '@/store/use-user-store';
import { cn } from '@/utils/cn';

export function GoalsAppSidebar() {
  const { name, avatarEmoji, theme, setTheme } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const menuSections = [
    {
      title: 'GOAL',
      items: [
        {
          id: 'home',
          label: 'Home',
          icon: Home,
          href: '/goals',
          isActive: pathname === '/goals',
        },
        {
          id: 'list',
          label: 'Goal List',
          icon: ListChecks,
          href: '/goals/manage',
          isActive: pathname.startsWith('/goals/manage'),
        },
        {
          id: 'history',
          label: 'History',
          icon: Clock3,
          href: '/goals/history',
          isActive: pathname.startsWith('/goals/history'),
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          id: 'create',
          label: 'Create Goal',
          icon: Plus,
          href: '/goals/create',
          isActive: pathname.startsWith('/goals/create'),
        },
      ],
    },
    {
      title: 'GENERAL',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          href: '/goals/settings',
          isActive: pathname.startsWith('/goals/settings'),
        },
      ],
    },
  ];

  const handleThemeToggle = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  return (
    <Sidebar className="border-r border-gray-100 bg-[#fffefb] p-0 text-gray-900 dark:border-zinc-800/80 dark:bg-[#12161f] dark:text-zinc-100">
      <SidebarHeader className="border-none bg-transparent p-5">
        <button
          type="button"
          onClick={() => {
            router.push('/goals');
            setOpenMobile(false);
          }}
          className="flex items-center gap-3 text-left"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30">
            <Flag className="size-5" aria-hidden="true" strokeWidth={2.5} />
          </span>
          <span className="truncate text-base font-extrabold tracking-tight text-gray-900 dark:text-white">
            Goal Tracker
          </span>
        </button>
      </SidebarHeader>

      <SidebarContent className="no-scrollbar space-y-4 overflow-y-auto bg-transparent px-3 py-1">
        {menuSections.map((section) => (
          <SidebarGroup key={section.title} className="space-y-1 p-0">
            <SidebarGroupLabel className="mb-1 px-3 text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        variant="primary"
                        onClick={() => {
                          router.push(item.href);
                          setOpenMobile(false);
                        }}
                        isActive={item.isActive}
                        className={cn(
                          'flex w-full items-center justify-between rounded px-3 py-5 text-xs font-bold transition-all duration-150',
                          item.isActive
                            ? 'font-extrabold shadow-2xs'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60',
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              'size-4 shrink-0',
                              item.isActive
                                ? 'text-primary-foreground'
                                : 'text-gray-500 dark:text-zinc-400',
                            )}
                            aria-hidden="true"
                          />
                          <span className="truncate">{item.label}</span>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="space-y-4 border-t border-gray-100 bg-transparent p-4 dark:border-zinc-800/80">
        <div className="flex items-center gap-1 rounded-full border border-gray-200/50 bg-[#f3f4f6] p-1 dark:border-zinc-700/40 dark:bg-zinc-800/80">
          <button
            type="button"
            aria-pressed={theme !== 'dark'}
            onClick={() => handleThemeToggle('light')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-bold transition-all',
              theme !== 'dark'
                ? 'bg-white font-black text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-white',
            )}
          >
            <Sun className="size-3.5" aria-hidden="true" />
            <span>Light</span>
          </button>
          <button
            type="button"
            aria-pressed={theme === 'dark'}
            onClick={() => handleThemeToggle('dark')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-bold transition-all',
              theme === 'dark'
                ? 'bg-primary font-black text-primary-foreground shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white',
            )}
          >
            <Moon className="size-3.5" aria-hidden="true" />
            <span>Dark</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              router.push('/account');
              setOpenMobile(false);
            }}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-base dark:bg-zinc-700">
              {avatarEmoji || '🎯'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-extrabold text-gray-900 dark:text-white">
                {name || 'User'}
              </span>
              <span className="block truncate text-[10px] text-gray-400 dark:text-zinc-400">
                Goal Tracker
              </span>
            </span>
          </button>

          <LogoutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
