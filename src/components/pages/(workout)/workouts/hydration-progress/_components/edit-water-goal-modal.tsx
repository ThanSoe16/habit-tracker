'use client';

import React, { useState } from 'react';
import { X, Droplet, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EditWaterGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoalMl: number;
  onApply: (goalMl: number) => void;
}

const PRESET_CHIPS = [2750, 3000, 3250, 3500];

export function EditWaterGoalModal({
  isOpen,
  onClose,
  currentGoalMl,
  onApply,
}: EditWaterGoalModalProps) {
  const [goal, setGoal] = useState<number>(currentGoalMl || 2500);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(goal);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-t-[32px] sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-t sm:border border-gray-100 dark:border-zinc-800 p-6 pb-12 sm:pb-6 space-y-6 animate-in slide-in-from-bottom duration-200">
        {/* Top Drag Handle */}
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-2 cursor-grab" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
            Edit Water Goal Intake
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Giant Number Display */}
        <div className="text-center space-y-1 py-3">
          <h2 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            {goal.toLocaleString()} <span className="text-2xl font-extrabold text-blue-600">ml</span>
          </h2>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            I wanna drink {goal.toLocaleString()} ml daily.
          </p>
        </div>

        {/* Interactive Range Slider */}
        <div className="space-y-2 px-2">
          <input
            type="range"
            min={1000}
            max={5000}
            step={50}
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />
          <div className="flex justify-between text-[11px] font-bold text-gray-400">
            <span>1,000 ml</span>
            <span>3,000 ml</span>
            <span>5,000 ml</span>
          </div>
        </div>

        {/* Quick Preset Chips */}
        <div className="flex items-center justify-center gap-2.5 pt-1">
          {PRESET_CHIPS.map((chipVal) => (
            <button
              key={chipVal}
              type="button"
              onClick={() => setGoal(chipVal)}
              className={cn(
                'px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-2xs',
                goal === chipVal
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-blue-50/70 dark:bg-zinc-800 border-blue-100 dark:border-zinc-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100',
              )}
            >
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>{chipVal.toLocaleString()}</span>
            </button>
          ))}
        </div>

        {/* Bottom Primary Apply Button */}
        <button
          type="button"
          onClick={handleApply}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Check className="w-4 h-4" />
          <span>Apply</span>
        </button>
      </div>
    </div>
  );
}
