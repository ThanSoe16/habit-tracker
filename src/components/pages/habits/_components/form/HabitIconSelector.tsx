import { useState } from 'react';
import { IconDrawerModal } from './IconDrawerModal';
import { ChevronRight } from 'lucide-react';

export const HabitIconSelector = ({
  value,
  setValue,
  selectedColor = '#2563eb',
  habitName,
}: {
  value: string;
  setValue: (value: string) => void;
  selectedColor?: string;
  habitName?: string;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayIcon = value || (habitName ? habitName.trim().charAt(0).toUpperCase() : '✨');

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-zinc-800/80 rounded-2xl border border-gray-100 dark:border-zinc-700/60 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xs transition-transform"
            style={{ backgroundColor: selectedColor, color: '#FFFFFF' }}
          >
            {displayIcon}
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            Icon ({displayIcon})
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold">
          <span>Choose Icon</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      <IconDrawerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedIcon={displayIcon}
        selectedColor={selectedColor}
        onSelectIcon={(icon) => setValue(icon)}
      />
    </>
  );
};
