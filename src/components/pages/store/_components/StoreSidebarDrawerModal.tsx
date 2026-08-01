'use client';

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  Archive,
  Mic,
  Image as ImageIcon,
  ChevronRight,
  Settings,
  BarChart3,
  Wallet,
  User,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/store/useUserStore';
import { useRouter, usePathname } from 'next/navigation';

interface StoreSidebarDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoreSidebarDrawerModal({
  isOpen,
  onClose,
}: StoreSidebarDrawerModalProps) {
  const { name, avatarEmoji } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  const isAccountPage = pathname === '/account';
  const isBudgetPage = pathname === '/budget';

  const menuSections = [
    {
      title: 'STORE',
      items: [
        {
          id: 'all-media',
          label: 'All Media',
          icon: Archive,
          action: () => router.push('/store'),
          isActive: pathname === '/store',
        },
        {
          id: 'voice-memos',
          label: 'Voice Memos',
          icon: Mic,
          action: () => router.push('/store/voice'),
          isActive: pathname === '/store/voice',
        },
        {
          id: 'gallery',
          label: 'Photos & Videos',
          icon: ImageIcon,
          action: () => router.push('/store/gallery'),
          isActive: pathname === '/store/gallery',
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
          id: 'report',
          label: 'Storage Report',
          icon: BarChart3,
          action: () => router.push('/store/report'),
          isActive: pathname === '/store/report',
        },
        {
          id: 'account',
          label: 'Account & Settings',
          icon: User,
          action: () => router.push('/account'),
          isActive: isAccountPage || pathname === '/store/settings',
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
            className="p-6 bg-gradient-to-b from-violet-50/70 to-transparent dark:from-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-left hover:bg-violet-50/40 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center text-2xl shadow-md shadow-violet-500/30 shrink-0">
                {avatarEmoji || '📦'}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <DrawerTitle className="text-base font-black text-gray-900 dark:text-white truncate">
                  {name || 'User'}
                </DrawerTitle>
                <DrawerDescription className="text-xs font-bold text-violet-600 dark:text-violet-400 truncate">
                  Media Store
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
                            ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
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

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Media Store v1.0
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
