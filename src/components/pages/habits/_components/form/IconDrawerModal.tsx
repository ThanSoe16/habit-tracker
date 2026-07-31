'use client';

import { useState } from 'react';
import { ChevronLeft, Search, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface IconDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIcon: string;
  selectedColor?: string;
  onSelectIcon: (icon: string) => void;
}

type IconTab = 'icons' | 'emojis' | 'text' | 'image';

const SUGGESTIONS = ['😴', '🌙', '💤', '🛌', '⭐', '🌈', '🌿', '🌌', '☕', '💧', '📚', '💪', '🧘'];
const FITNESS_ICONS = ['🏃', '🚴', '🏋️', '🧘', '🤸', '🏊', '🚣', '⛹️', '🚶', '🧗', '🥊', '⚽', '🎾'];
const HEALTH_ICONS = ['💧', '🍎', '🥗', '💊', '🫀', '🩺', '🥑', '🍵', '🍊', '🍌', '🥛', '🥕'];
const PRODUCTIVITY_ICONS = ['📚', '✍️', '💡', '🧠', '🎯', '💻', '🎨', '🎵', '📅', '📝', '⌛', '⏰'];

import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';

export function IconDrawerModal({
  isOpen,
  onClose,
  selectedIcon,
  selectedColor = '#2563eb',
  onSelectIcon,
}: IconDrawerModalProps) {
  const [activeTab, setActiveTab] = useState<IconTab>('icons');
  const [searchQuery, setSearchQuery] = useState('');
  const [customText, setCustomText] = useState(selectedIcon && selectedIcon.length <= 3 ? selectedIcon : 'ABC');

  const handleSelect = (icon: string) => {
    onSelectIcon(icon);
    onClose();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 3);
    setCustomText(val);
    onSelectIcon(val || 'A');
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="z-[70] max-w-lg mx-auto rounded-t-[36px] pb-8 max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-gray-100 dark:border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <DrawerTitle className="text-lg font-black text-gray-900 dark:text-white">Icon</DrawerTitle>

          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Segmented Tab Selector (Icons | Emojis | Text | Image) */}
        <div className="px-6 pt-4 pb-2">
          <div className="bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-2xl flex gap-1">
            {(
              [
                { id: 'icons', label: 'Icons' },
                { id: 'emojis', label: 'Emojis' },
                { id: 'text', label: 'Text' },
                { id: 'image', label: 'Image' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize',
                  activeTab === tab.id
                    ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 no-scrollbar">
          {(activeTab === 'icons' || activeTab === 'emojis') && (
            <div className="space-y-6">
              {/* Suggestions Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Suggestions
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {SUGGESTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-transform active:scale-90',
                        selectedIcon === item
                          ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 scale-105'
                          : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fitness Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Fitness
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {FITNESS_ICONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-transform active:scale-90',
                        selectedIcon === item
                          ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 scale-105'
                          : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Health Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Health & Wellness
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {HEALTH_ICONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-transform active:scale-90',
                        selectedIcon === item
                          ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 scale-105'
                          : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Productivity Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Productivity
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {PRODUCTIVITY_ICONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-transform active:scale-90',
                        selectedIcon === item
                          ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 scale-105'
                          : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TEXT TAB (Matching design-guide/icon-drawer-2.PNG) */}
          {activeTab === 'text' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
              <div
                className="w-36 h-36 rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg transition-all"
                style={{ backgroundColor: selectedColor, color: '#FFFFFF' }}
              >
                {customText || 'ABC'}
              </div>
              <p className="text-xs font-bold text-gray-400">{customText.length}/3</p>

              <div className="w-full space-y-2">
                <input
                  type="text"
                  maxLength={3}
                  value={customText}
                  onChange={handleTextChange}
                  placeholder="Enter 1-3 letters"
                  className="w-full text-center px-4 py-3.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl font-bold text-lg uppercase border-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSelect(customText || 'A')}
                className="w-full py-3.5 rounded-2xl bg-[#2563eb] text-white font-bold text-sm shadow-lg shadow-blue-500/30"
              >
                Apply Text Icon
              </button>
            </div>
          )}

          {/* IMAGE TAB */}
          {activeTab === 'image' && (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mx-auto">
                🖼️
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Custom image avatars coming soon!</p>
            </div>
          )}
        </div>

        {/* Fixed Search Bar at Bottom (matching reference mockup) */}
        {(activeTab === 'icons' || activeTab === 'emojis') && (
          <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search icon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-zinc-800 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
