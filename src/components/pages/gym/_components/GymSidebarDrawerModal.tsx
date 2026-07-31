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
  Dumbbell,
  ChevronRight,
  Settings,
  Grid,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';

export type GymTab = 'today' | 'plan' | 'history';

interface GymSidebarDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: GymTab;
  onSelectTab: (tab: GymTab) => void;
}

export function GymSidebarDrawerModal({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
}: GymSidebarDrawerModalProps) {
  const { name, avatarEmoji } = useUserStore();
  const router = useRouter();

  const menuSections = [
    {
      title: 'Workout Views',
      items: [
        {
          id: 'today',
          label: 'Today',
          icon: Sparkles,
          action: () => onSelectTab('today'),
          isActive: activeTab === 'today',
        },
        {
          id: 'plan',
          label: '7-Day Plan',
          icon: Calendar,
          action: () => onSelectTab('plan'),
          isActive: activeTab === 'plan',
        },
        {
          id: 'history',
          label: 'History',
          icon: History,
          action: () => onSelectTab('history'),
          isActive: activeTab === 'history',
        },
      ],
    },
    {
      title: 'Workout Management',
      items: [
        {
          id: 'edit-plan',
          label: 'Edit Workout Plan',
          icon: Dumbbell,
          action: () => onSelectTab('plan'),
          isActive: false,
        },
        {
          id: 'units',
          label: 'Units & Measurements',
          icon: Grid,
          action: () => router.push('/design-guide/units'),
          isActive: false,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          action: () => router.push('/settings'),
          isActive: false,
        },
      ],
    },
  ];

  return (
    <Drawer direction="left" open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-white dark:bg-zinc-900 h-full w-[280px] max-w-[85vw] rounded-r-3xl border-r border-gray-100 dark:border-zinc-800 p-0 overflow-hidden flex flex-col justify-between">
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          {/* User Profile Header */}
          <div className="p-6 bg-linear-to-b from-blue-50/70 to-transparent dark:from-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md shadow-blue-500/30 shrink-0">
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
          </div>

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
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/80'
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
