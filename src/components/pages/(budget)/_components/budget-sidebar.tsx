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
  Home,
  Calendar,
  TrendingDown,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  ArrowRightLeft,
  HandCoins,
  Wallet,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/store/use-user-store';
import { useRouter, usePathname } from 'next/navigation';

export function BudgetAppSidebar() {
  const { name, avatarEmoji, theme, setTheme } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useShadcnSidebar();

  const isHomeActive = pathname === '/budget';
  const isFamilyActive = pathname === '/budget/family';
  const isIncomeActive = pathname === '/budget/income';
  const isExpensesActive = pathname === '/budget/expenses';
  const isSalaryActive = pathname === '/budget/salary';
  const isExchangeActive = pathname === '/budget/exchange';
  const isLoansActive = pathname === '/budget/loans';
  const isReportsActive = pathname === '/budget-generals/reports';
  const isSettingsActive = pathname === '/budget-generals/settings';

  const menuSections = [
    {
      title: 'BUDGET',
      items: [
        {
          id: 'budget-home',
          label: 'Home',
          icon: Home,
          action: () => {
            router.push('/budget');
            setOpenMobile(false);
          },
          isActive: isHomeActive,
        },
        {
          id: 'budget-family',
          label: 'Family Budget',
          icon: Users,
          action: () => {
            router.push('/budget/family');
            setOpenMobile(false);
          },
          isActive: isFamilyActive,
        },
        {
          id: 'budget-income',
          label: 'Income',
          icon: TrendingUp,
          action: () => {
            router.push('/budget/income');
            setOpenMobile(false);
          },
          isActive: isIncomeActive,
        },
        {
          id: 'budget-expenses',
          label: 'Expenses',
          icon: TrendingDown,
          action: () => {
            router.push('/budget/expenses');
            setOpenMobile(false);
          },
          isActive: isExpensesActive,
        },
        {
          id: 'budget-salary',
          label: 'Monthly Salary',
          icon: Calendar,
          action: () => {
            router.push('/budget/salary');
            setOpenMobile(false);
          },
          isActive: isSalaryActive,
        },
        {
          id: 'budget-exchange',
          label: 'Currency Exchange',
          icon: ArrowRightLeft,
          action: () => {
            router.push('/budget/exchange');
            setOpenMobile(false);
          },
          isActive: isExchangeActive,
        },
        {
          id: 'budget-loans',
          label: 'Loan & Borrow',
          icon: HandCoins,
          action: () => {
            router.push('/budget/loans');
            setOpenMobile(false);
          },
          isActive: isLoansActive,
        },
      ],
    },
    {
      title: 'GENERAL',
      items: [
        {
          id: 'budget-reports',
          label: 'Budget Reports',
          icon: BarChart3,
          action: () => {
            router.push('/budget-generals/reports');
            setOpenMobile(false);
          },
          isActive: isReportsActive,
        },
        {
          id: 'budget-settings',
          label: 'Budget Settings',
          icon: Settings,
          action: () => {
            router.push('/budget-generals/settings');
            setOpenMobile(false);
          },
          isActive: isSettingsActive,
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
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/30">
            <Wallet className="w-5 h-5 fill-white stroke-none text-emerald-600" />
          </div>
          <h2 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight">
            Budget Tracker
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
                          'w-full flex items-center justify-between px-3 py-5 rounded font-bold text-xs transition-all duration-150',
                          item.isActive
                            ? 'bg-primary/50 text-foreground font-extrabold shadow-2xs'
                            : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/60',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              'w-4 h-4 shrink-0',
                              item.isActive
                                ? 'text-foreground'
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
                ? 'bg-emerald-600 text-white shadow-sm font-black'
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
              {avatarEmoji || '💰'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                {name || 'User'}
              </h4>
              <p className="text-[10px] text-gray-400 dark:text-zinc-400 truncate">
                Budget Tracker
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

export { ShadcnSidebarProvider };
