import { useState } from 'react';
import { ColorDrawerModal } from './color-drawer-modal';
import { ChevronRight } from 'lucide-react';

export const HabitColorSelector = ({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-zinc-800/80 rounded-2xl border border-gray-100 dark:border-zinc-700/60 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full shadow-xs border-2 border-white dark:border-zinc-700"
            style={{ backgroundColor: value || '#2563eb' }}
          />
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            Color
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold">
          <span>Choose Color</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      <ColorDrawerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedColor={value || '#2563eb'}
        onSelectColor={(color) => setValue(color)}
      />
    </>
  );
};
