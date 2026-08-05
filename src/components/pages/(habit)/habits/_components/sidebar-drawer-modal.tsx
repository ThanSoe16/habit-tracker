'use client';

import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import {
  Calendar,
  BarChart2,
  TrendingUp,
  Settings,
  ChevronRight,
  Sparkles,
  ListTodo,
  CheckSquare,
  Wallet,
  User,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/store/use-user-store';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface SidebarDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentViewMode?: 'today' | 'weekly' | 'overall';
  onSelectViewMode?: (mode: 'today' | 'weekly' | 'overall') => void;
}

export function SidebarDrawerModal({ isOpen, onClose, onSelectViewMode }: SidebarDrawerModalProps) {
  const { name, avatarEmoji } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

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
  const isAccountPage = pathname === '/account';
  const isBudgetPage = pathname === '/budget';

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
          action: () => router.push('/managements/regular'),
          isActive: isRegularHabitActive,
        },
        {
          id: 'one-time-task',
          label: 'One-Time Task',
          icon: CheckSquare,
          action: () => router.push('/managements/one-time'),
          isActive: isOneTimeTaskActive,
        },
      ],
    },
    {
      title: 'GENERAL',
      items: [
        {
          id: 'budget',
          label: 'Budget Tracker',
          icon: Wallet,
          action: () => router.push('/budget'),
          isActive: isBudgetPage,
        },
        {
          id: 'reports',
          label: 'Reports & Insights',
          icon: BarChart2,
          action: () => router.push('/generals/reports'),
          isActive: isReportPage,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          action: () => router.push('/generals/settings'),
          isActive: isSettingsPage,
        },
        {
          id: 'account',
          label: 'Account',
          icon: User,
          action: () => router.push('/account'),
          isActive: isAccountPage,
        },
      ],
    },
  ];

  return (
    <Drawer direction="left" open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-white dark:bg-zinc-900 h-full w-[280px] max-w-[85vw] rounded-r-3xl border-r border-gray-100 dark:border-zinc-800 p-0 overflow-hidden flex flex-col justify-between">
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          {/* User Profile Card Header */}
          <button
            type="button"
            onClick={() => {
              router.push('/account');
              onClose();
            }}
            className="p-6 bg-gradient-to-b from-blue-50/70 to-transparent dark:from-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-left hover:bg-blue-50/40 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl shadow-md shadow-primary/30 shrink-0">
                {avatarEmoji || '😊'}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <DrawerTitle className="text-base font-black text-gray-900 dark:text-white truncate">
                  {name || 'User'}
                </DrawerTitle>
                <DrawerDescription className="text-xs font-semibold text-gray-400 truncate">
                  Habit Tracker
                </DrawerDescription>
              </div>
            </div>
          </button>

          {/* Navigation Sections */}
          <div className="p-4 space-y-6 flex-1">
            {menuSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                <p className="px-3 text-[11px] font-black uppercase tracking-wider text-gray-400">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        className={cn(
                          'w-full px-3.5 py-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all',
                          item.isActive
                            ? 'bg-primary text-white shadow-md shadow-primary/25'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/80',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <IconComp className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer App Info */}
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Grit Habit Tracker v1.0
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
