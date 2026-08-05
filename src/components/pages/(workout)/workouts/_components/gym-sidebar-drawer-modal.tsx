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
  Sparkles,
  Calendar,
  History,
  User,
  Activity,
  Settings,
  ChevronRight,
  Scale,
  Dumbbell,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/store/use-user-store';
import { useRouter, usePathname } from 'next/navigation';

export type GymTab = 'today' | 'plan' | 'history';

interface GymSidebarProps {
  activeTab?: GymTab;
  onSelectTab?: (tab: GymTab) => void;
}

export function GymAppSidebar({ activeTab = 'today', onSelectTab }: GymSidebarProps) {
  const { name, avatarEmoji, theme, setTheme } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useShadcnSidebar();

  const isWorkoutToday = pathname === '/gym/today' || pathname === '/gym';
  const isWorkoutPlan = pathname === '/gym/plan';
  const isWorkoutHistory = pathname === '/gym/history';
  const isProfilePage = pathname === '/gym/profile';
  const isProfileHistoryPage = pathname === '/gym/profile/history';
  const isSettingsPage = pathname === '/gym/settings';
  const isAccountPage = pathname === '/account';

  const menuSections = [
    {
      title: 'WORKOUT',
      items: [
        {
          id: 'today',
          label: 'Today',
          icon: Sparkles,
          action: () => {
            if (onSelectTab) onSelectTab('today');
            router.push('/gym/today');
            setOpenMobile(false);
          },
          isActive: isWorkoutToday,
        },
        {
          id: 'plan',
          label: '7-Day Plan',
          icon: Calendar,
          action: () => {
            if (onSelectTab) onSelectTab('plan');
            router.push('/gym/plan');
            setOpenMobile(false);
          },
          isActive: isWorkoutPlan,
        },
        {
          id: 'history',
          label: 'History',
          icon: History,
          action: () => {
            if (onSelectTab) onSelectTab('history');
            router.push('/gym/history');
            setOpenMobile(false);
          },
          isActive: isWorkoutHistory,
        },
      ],
    },
    {
      title: 'PERSONAL INFO',
      items: [
        {
          id: 'info-progress',
          label: 'Info & Progress',
          icon: Activity,
          action: () => {
            router.push('/gym/profile');
            setOpenMobile(false);
          },
          isActive: isProfilePage,
        },
        {
          id: 'metrics-history',
          label: 'History',
          icon: Scale,
          action: () => {
            router.push('/gym/profile/history');
            setOpenMobile(false);
          },
          isActive: isProfileHistoryPage,
        },
        {
          id: 'gym-settings',
          label: 'Gym Settings',
          icon: Settings,
          action: () => {
            router.push('/gym/settings');
            setOpenMobile(false);
          },
          isActive: isSettingsPage,
        },
      ],
    },
    {
      title: 'GENERAL',
      items: [
        {
          id: 'account',
          label: 'Account & Settings',
          icon: User,
          action: () => {
            router.push('/account');
            setOpenMobile(false);
          },
          isActive: isAccountPage,
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
      {/* 1. LOGO HEADER */}
      <SidebarHeader className="p-5 border-none bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-600/30">
            <Dumbbell className="w-5 h-5 fill-white stroke-none" />
          </div>
          <h2 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight">
            Workout Tracker
          </h2>
        </div>
      </SidebarHeader>

      {/* 2. MENU SECTIONS */}
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
                          'w-full flex items-center justify-between px-3.5 py-3 rounded-full font-bold text-xs transition-all duration-150',
                          item.isActive
                            ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white font-extrabold shadow-sm'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/60',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              'w-4 h-4 shrink-0',
                              item.isActive ? 'text-white' : 'text-gray-500 dark:text-zinc-400',
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <ChevronRight
                          className={cn(
                            'w-3.5 h-3.5 opacity-60',
                            item.isActive ? 'text-white' : 'text-gray-400',
                          )}
                        />
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
                ? 'bg-blue-600 text-white shadow-sm font-black'
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
              {avatarEmoji || '🏋️'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                {name || 'Profile'}
              </h4>
              <p className="text-[10px] text-gray-400 dark:text-zinc-400 truncate">
                Workout Tracker
              </p>
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

export { ShadcnSidebarProvider, GymAppSidebar as GymSidebarDrawerModal };
