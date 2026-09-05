'use client';

import * as React from 'react';
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
  SidebarProvider as ShadcnSidebarProvider,
  useSidebar as useShadcnSidebar,
} from '@/components/ui/sidebar';
import {
  Calendar,
  BarChart2,
  TrendingUp,
  Sparkles,
  CheckSquare,
  Settings,
  Sun,
  Moon,
  LogOut,
  Hexagon,
  Brain,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/store/use-user-store';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface HabitSidebarProps {
  onSelectViewMode?: (mode: 'today' | 'weekly' | 'overall') => void;
}

export function HabitAppSidebar({ onSelectViewMode }: HabitSidebarProps) {
  const { name, avatarEmoji, theme, setTheme } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const { setOpenMobile } = useShadcnSidebar();

  const isTodayActive =
    pathname === '/habits/today' ||
    pathname === '/today' ||
    pathname === '/home/today' ||
    pathname === '/home' ||
    pathname === '/';
  const isWeeklyActive =
    pathname === '/habits/weekly' || pathname === '/weekly' || pathname === '/home/weekly';
  const isOverallActive =
    pathname === '/habits/overall' || pathname === '/overall' || pathname === '/home/overall';
  const isRegularHabitActive =
    pathname === '/managements/regular' ||
    pathname === '/habits/regular' ||
    (pathname === '/habits' && tabParam !== 'task');
  const isOneTimeTaskActive =
    pathname === '/managements/one-time' ||
    pathname === '/habits/one-time' ||
    (pathname === '/habits' && tabParam === 'task');
  const isReportPage =
    pathname === '/generals/reports' || pathname === '/general/reports' || pathname === '/report';
  const isSettingsPage =
    pathname === '/generals/settings' ||
    pathname === '/general/settings' ||
    pathname === '/settings';
  const isDigitalWellbeingPage = pathname.startsWith('/digital-wellbeing');

  const menuSections = [
    {
      title: 'HABIT',
      items: [
        {
          id: 'today',
          label: 'Today',
          icon: Calendar,
          action: () => {
            if (onSelectViewMode) onSelectViewMode('today');
            router.push('/habits/today');
            setOpenMobile(false);
          },
          isActive: isTodayActive,
        },
        {
          id: 'weekly',
          label: 'Weekly',
          icon: BarChart2,
          action: () => {
            if (onSelectViewMode) onSelectViewMode('weekly');
            router.push('/habits/weekly');
            setOpenMobile(false);
          },
          isActive: isWeeklyActive,
        },
        {
          id: 'overall',
          label: 'Overall',
          icon: TrendingUp,
          action: () => {
            if (onSelectViewMode) onSelectViewMode('overall');
            router.push('/habits/overall');
            setOpenMobile(false);
          },
          isActive: isOverallActive,
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          id: 'regular-habit',
          label: 'Regular Habit',
          icon: Sparkles,
          action: () => {
            router.push('/managements/regular');
            setOpenMobile(false);
          },
          isActive: isRegularHabitActive,
        },
        {
          id: 'one-time-task',
          label: 'One-Time Task',
          icon: CheckSquare,
          action: () => {
            router.push('/managements/one-time');
            setOpenMobile(false);
          },
          isActive: isOneTimeTaskActive,
        },
      ],
    },
    {
      title: 'GENERAL',
      items: [
        {
          id: 'digital-wellbeing',
          label: 'Digital Wellbeing',
          icon: Brain,
          action: () => {
            router.push('/digital-wellbeing');
            setOpenMobile(false);
          },
          isActive: isDigitalWellbeingPage,
        },
        {
          id: 'reports',
          label: 'Reports & Insights',
          icon: BarChart2,
          action: () => {
            router.push('/generals/reports');
            setOpenMobile(false);
          },
          isActive: isReportPage,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          action: () => {
            router.push('/generals/settings');
            setOpenMobile(false);
          },
          isActive: isSettingsPage,
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
    <Sidebar className="border-r border-gray-100 dark:border-zinc-800/80 bg-[#fffefb] dark:bg-[#12161f] text-gray-900 dark:text-zinc-100 p-0">
      {/* 1. LOGO HEADER & SEARCH */}
      <SidebarHeader className="p-5 border-none bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-md shadow-primary/30">
            <Hexagon className="w-5 h-5 fill-white stroke-none" />
          </div>
          <h2 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight">
            Habit Tracker
          </h2>
        </div>
      </SidebarHeader>

      {/* 2. HABIT APP ROUTE NAVIGATION STRUCTURE */}
      <SidebarContent className="px-3 py-1 space-y-4 bg-transparent overflow-y-auto no-scrollbar">
        {menuSections.map((section) => (
          <SidebarGroup key={section.title} className="p-0 space-y-1">
            <SidebarGroupLabel className="text-[11px] font-black text-gray-400 dark:text-zinc-500 tracking-wider px-3 mb-1 uppercase">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={item.action}
                        isActive={item.isActive}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-5 rounded font-bold text-xs transition-all duration-150',
                          item.isActive
                            ? 'data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary data-active:hover:text-primary-foreground font-extrabold shadow-2xs'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/60',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              'w-4 h-4 shrink-0',
                              item.isActive
                                ? 'text-primary-foreground'
                                : 'text-gray-500 dark:text-zinc-400',
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* 3. LIGHT / DARK MODE TOGGLE & PROFILE FOOTER */}
      <SidebarFooter className="p-4 space-y-4 border-t border-gray-100 dark:border-zinc-800/80 bg-transparent">
        {/* Light / Dark Mode Toggle Pill */}
        <div className="bg-[#f3f4f6] dark:bg-zinc-800/80 p-1 rounded-full flex items-center gap-1 border border-gray-200/50 dark:border-zinc-700/40">
          <button
            type="button"
            onClick={() => handleThemeToggle('light')}
            className={cn(
              'flex-1 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
              theme !== 'dark'
                ? 'bg-white text-gray-900 shadow-sm font-black'
                : 'text-gray-400 hover:text-white',
            )}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => handleThemeToggle('dark')}
            className={cn(
              'flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
              theme === 'dark'
                ? 'bg-primary text-primary-foreground shadow-sm font-black'
                : 'text-gray-500 hover:text-gray-900',
            )}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
        </div>

        {/* User Profile Bar */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              router.push('/account');
              setOpenMobile(false);
            }}
            className="flex items-center gap-3 text-left min-w-0 flex-1"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-700 text-base flex items-center justify-center shrink-0">
              {avatarEmoji || '😊'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                {name || 'Profile'}
              </h4>
              <p className="text-[10px] text-gray-400 dark:text-zinc-400 truncate">Habit Tracker</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/account')}
            className="w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Account Settings"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export { ShadcnSidebarProvider };
