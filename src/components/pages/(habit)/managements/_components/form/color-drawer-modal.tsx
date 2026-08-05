'use client';

import { useRef } from 'react';
import { ChevronLeft, Check, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { COLORS } from '@/features/habits/data';

interface ColorDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';

export function ColorDrawerModal({
  isOpen,
  onClose,
  selectedColor,
  onSelectColor,
}: ColorDrawerModalProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const isCustomColor = !COLORS.includes(selectedColor);

  const handleSelect = (color: string) => {
    onSelectColor(color);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="z-[70] max-w-lg mx-auto rounded-t-[36px] pb-8 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-gray-100 dark:border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <DrawerTitle className="text-lg font-black text-gray-900 dark:text-white">Color</DrawerTitle>
          <div className="w-10 h-10" />
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Active Color Preview Card */}
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div
              className="w-20 h-20 rounded-3xl shadow-lg border-2 border-white dark:border-zinc-800 flex items-center justify-center transition-transform scale-105"
              style={{ backgroundColor: selectedColor }}
            >
              <Check className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {selectedColor}
            </span>
          </div>

          {/* Color Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Preset Colors
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={cn(
                    'w-13 h-13 rounded-2xl transition-all flex items-center justify-center border-2 border-transparent hover:scale-105 active:scale-95',
                    selectedColor === c && 'ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-md',
                  )}
                  style={{ backgroundColor: c }}
                >
                  {selectedColor === c && <Check className="w-6 h-6 text-white drop-shadow-sm" />}
                </button>
              ))}

              {/* Custom Color Button */}
              <div className="relative flex flex-col items-center justify-center">
                <input
                  type="color"
                  ref={colorInputRef}
                  className="absolute inset-0 opacity-0 w-13 h-13 cursor-pointer"
                  onChange={(e) => handleSelect(e.target.value)}
                  value={isCustomColor ? selectedColor : '#2563eb'}
                />
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className={cn(
                    'w-13 h-13 rounded-2xl flex items-center justify-center border transition-all overflow-hidden',
                    isCustomColor
                      ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-md'
                      : 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-200',
                  )}
                  style={isCustomColor ? { backgroundColor: selectedColor } : {}}
                >
                  {isCustomColor ? (
                    <Check className="w-6 h-6 text-white drop-shadow-sm" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-linear-to-tr from-red-500 via-green-500 to-blue-500 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white font-bold" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
