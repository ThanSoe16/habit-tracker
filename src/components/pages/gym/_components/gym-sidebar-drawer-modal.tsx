'use client';

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  Sparkles,
  Calendar,
  History,
  User,
  Activity,
  BarChart2,
  Settings,
  ChevronRight,
  Scale,
  Wallet,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/store/use-user-store';
import { useRouter, usePathname } from 'next/navigation';

export type GymTab = 'today' | 'plan' | 'history';

interface GymSidebarDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: GymTab;
  onSelectTab?: (tab: GymTab) => void;
}

export function GymSidebarDrawerModal({
  isOpen,
  onClose,
  activeTab = 'today',
  onSelectTab,
}: GymSidebarDrawerModalProps) {
  const { name, avatarEmoji } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  const isWorkoutToday = pathname === '/gym/today' || pathname === '/gym';
  const isWorkoutPlan = pathname === '/gym/plan';
  const isWorkoutHistory = pathname === '/gym/history';
  const isProfilePage = pathname === '/gym/profile';
  const isProfileHistoryPage = pathname === '/gym/profile/history';
  const isReportPage = pathname === '/gym/reports' || pathname === '/report';
  const isSettingsPage = pathname === '/gym/settings';
  const isAccountPage = pathname === '/account';
  const isBudgetPage = pathname === '/budget';

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
          action: () => router.push('/gym/profile'),
          isActive: isProfilePage,
        },
        {
          id: 'metrics-history',
          label: 'History',
          icon: Scale,
          action: () => router.push('/gym/profile/history'),
          isActive: isProfileHistoryPage,
        },
        {
          id: 'gym-settings',
          label: 'Gym Settings',
          icon: Settings,
          action: () => router.push('/gym/settings'),
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
          {/* User Profile Header */}
          <button
            type="button"
            onClick={() => {
              router.push('/account');
              onClose();
            }}
            className="p-6 bg-gradient-to-b from-blue-50/70 to-transparent dark:from-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-left hover:bg-blue-50/40 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md shadow-primary/30 shrink-0">
                {avatarEmoji || '🏋️'}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <DrawerTitle className="text-base font-black text-gray-900 dark:text-white truncate">
                  {name || 'User'}
                </DrawerTitle>
                <DrawerDescription className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">
                  Workout Tracker
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
                            ? 'bg-blue-600 text-white shadow-md shadow-primary/25'
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

          {/* Footer Info */}
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Gym & Fitness Split v1.0
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
