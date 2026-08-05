'use client';

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  Home,
  Calendar,
  TrendingDown,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
  ArrowRightLeft,
  HandCoins,
  LogIn,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/store/use-user-store';
import { useRouter, usePathname } from 'next/navigation';

interface BudgetSidebarDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection?: (section: 'home' | 'salary' | 'expenses') => void;
}

export function BudgetSidebarDrawerModal({
  isOpen,
  onClose,
  onSelectSection,
}: BudgetSidebarDrawerModalProps) {
  const { name, avatarEmoji } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  const menuSections = [
    {
      title: 'BUDGET',
      items: [
        {
          id: 'budget-home',
          label: 'Home',
          icon: Home,
          action: () => router.push('/budget'),
          isActive: pathname === '/budget',
        },
        {
          id: 'budget-family',
          label: 'Family Budget',
          icon: Users,
          action: () => router.push('/budget/family'),
          isActive: pathname.startsWith('/budget/family'),
        },
        {
          id: 'budget-income',
          label: 'Income',
          icon: TrendingUp,
          action: () => router.push('/budget/income'),
          isActive: pathname.startsWith('/budget/income'),
        },
        {
          id: 'budget-expenses',
          label: 'Expenses',
          icon: TrendingDown,
          action: () => router.push('/budget/expenses'),
          isActive: pathname.startsWith('/budget/expenses'),
        },
        {
          id: 'budget-salary',
          label: 'Monthly Salary',
          icon: Calendar,
          action: () => router.push('/budget/salary'),
          isActive: pathname.startsWith('/budget/salary'),
        },
        {
          id: 'budget-exchange',
          label: 'Currency Exchange',
          icon: ArrowRightLeft,
          action: () => router.push('/budget/exchange'),
          isActive: pathname.startsWith('/budget/exchange'),
        },
        {
          id: 'budget-loans',
          label: 'Loan & Borrow',
          icon: HandCoins,
          action: () => router.push('/budget/loans'),
          isActive: pathname.startsWith('/budget/loans'),
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
          action: () => router.push('/budget/reports'),
          isActive: pathname.startsWith('/budget/reports'),
        },
        {
          id: 'budget-settings',
          label: 'Budget Settings',
          icon: Settings,
          action: () => router.push('/budget/settings'),
          isActive: pathname.startsWith('/budget/settings'),
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
            className="p-6 bg-gradient-to-b from-emerald-50/70 to-transparent dark:from-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-left hover:bg-emerald-50/40 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md shadow-emerald-500/30 shrink-0">
                {avatarEmoji || '💰'}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <DrawerTitle className="text-base font-black text-gray-900 dark:text-white truncate">
                  {name || 'User'}
                </DrawerTitle>
                <DrawerDescription className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                  Budget Tracker
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
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
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
              Budget Tracker v1.0
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
