'use client';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Calendar, BarChart2, TrendingUp, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ViewModeDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: 'today' | 'weekly' | 'overall';
  onSelectMode: (mode: 'today' | 'weekly' | 'overall') => void;
}

export function ViewModeDrawerModal({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
}: ViewModeDrawerModalProps) {
  const options = [
    {
      id: 'today',
      title: 'Today',
      description: "Daily routine and today's habits",
      icon: Calendar,
    },
    {
      id: 'weekly',
      title: 'Weekly',
      description: 'Weekly overview and completion progress',
      icon: BarChart2,
    },
    {
      id: 'overall',
      title: 'Overall',
      description: 'Long-term statistics and streak analysis',
      icon: TrendingUp,
    },
  ] as const;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-white dark:bg-zinc-900 rounded-t-[2.5rem]">
        <div className="mx-auto w-full max-w-sm px-6 pt-2 pb-10 space-y-6">
          <DrawerHeader className="p-0 text-center">
            <DrawerTitle className="text-xl font-black text-gray-900 dark:text-white">
              Select View Mode
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-3">
            {options.map((option) => {
              const IconComp = option.icon;
              const isSelected = currentMode === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSelectMode(option.id);
                    onClose();
                  }}
                  className={cn(
                    'w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between',
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-[#2563eb] text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                      : 'bg-gray-50 dark:bg-zinc-800/80 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0',
                        isSelected
                          ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/30'
                          : 'bg-white dark:bg-zinc-700 text-gray-500'
                      )}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white leading-snug">
                        {option.title}
                      </p>
                      <p className="text-xs font-medium text-gray-400 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-7 h-7 rounded-full bg-[#2563eb] text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
