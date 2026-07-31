'use client';

import { useRef, useCallback } from 'react';
import { Check, Clock, Flame, Plus, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Habit } from '@/store/useHabitStore';
import { getContrastColor } from '@/utils/colorUtils';

interface HabitCardProps {
  habit: Habit;
  date: Date;
  isLast?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
  onQuickAdd?: (e: React.MouseEvent) => void;
  onQuickSubtract?: (e: React.MouseEvent) => void;
  onQuickComplete?: (e: React.MouseEvent) => void;
}

const LONG_PRESS_DURATION = 500; // ms

export function HabitCard({
  habit,
  date,
  isLast,
  onClick,
  onLongPress,
  onQuickAdd,
  onQuickSubtract,
  onQuickComplete,
}: HabitCardProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  // Use local time date string to avoid timezone issues
  const dateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const historyEntry = habit.history[dateString];
  const isCompleted = typeof historyEntry === 'boolean' ? historyEntry : historyEntry?.completed;
  const timeTaken = typeof historyEntry === 'object' ? historyEntry?.timeTaken : undefined;
  const count = typeof historyEntry === 'object' ? historyEntry?.count : undefined;

  const unitLabel = habit.unit || (habit.unitType === 'time' ? 'mins' : 'times');

  const currentProgress = () => {
    if (habit.unitType === 'count') {
      const current = parseInt(String(count) || '0', 10);
      return `${current} / ${habit.goalValue || 1} ${unitLabel}`;
    }
    if (habit.unitType === 'time') {
      const current = timeTaken ? String(timeTaken) : '0';
      return `${current} / ${habit.goalValue || 1} ${habit.timeUnit || 'min'}`;
    }
    if (habit.unitType === 'duration') {
      const current = timeTaken ? String(timeTaken) : '0';
      return `${current} / ${habit.goalValue || 1} mins (${habit.timerMode === 'down' ? 'Count Down' : 'Count Up'})`;
    }
    return null;
  };

  const handleTouchStart = useCallback(() => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress?.();
    }, LONG_PRESS_DURATION);
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    // Only trigger click if it wasn't a long press
    if (!isLongPressRef.current) {
      onClick?.();
    }
    isLongPressRef.current = false;
  }, [onClick]);

  const habitColor = habit.color || '#2563eb';

  // Calculate percentage completion for background progress fill
  let pct = 0;
  if (isCompleted) {
    pct = 100;
  } else if (habit.unitType === 'count') {
    const current = parseInt(String(count) || '0', 10);
    pct = Math.min(100, Math.max(0, (current / (habit.goalValue || 1)) * 100));
  } else if (habit.unitType === 'time' || habit.unitType === 'duration') {
    const current = parseInt(String(timeTaken) || '0', 10);
    pct = Math.min(100, Math.max(0, (current / (habit.goalValue || 1)) * 100));
  }

  return (
    <div
      className="relative flex items-center cursor-pointer select-none group"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {/* Card Body Container with Dual-Tone Fill */}
      <div
        className="relative flex-1 rounded-2xl p-3 flex items-center justify-between overflow-hidden shadow-xs hover:shadow-md transition-all border border-black/5"
        style={{
          backgroundColor: isCompleted ? habitColor : `${habitColor}22`,
        }}
      >
        {/* Progress Overlay Fill */}
        {!isCompleted && pct > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 transition-all duration-300 rounded-2xl"
            style={{
              width: `${pct}%`,
              backgroundColor: habitColor,
            }}
          />
        )}

        {/* Content Container */}
        <div className="relative z-10 flex items-center gap-3.5">
          {/* Icon Box */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
            }}
          >
            {habit.emoji || habit.name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-0.5">
            <h3
              className={cn(
                'font-black text-sm leading-snug',
                pct > 50 || isCompleted ? 'text-white' : 'text-gray-900 dark:text-white'
              )}
            >
              {habit.name}
            </h3>
            <p
              className={cn(
                'text-xs font-semibold',
                pct > 50 || isCompleted ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {currentProgress() || (habit.timeOfDay ? `${habit.timeOfDay} routine` : 'Every day')}
            </p>
          </div>
        </div>

        {/* Action Controls & Streak Badge */}
        <div className="relative z-10 flex items-center gap-2">
          {/* Streak Counter */}
          <div
            className={cn(
              'flex items-center gap-0.5 text-[11px] font-black',
              pct > 50 || isCompleted ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
            )}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{habit.streak || 1}</span>
          </div>

          {/* Action Buttons */}
          {!isCompleted && habit.unitType === 'count' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickSubtract?.(e);
              }}
              className="w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs"
              title="Subtract count"
            >
              <Minus className="w-4 h-4" strokeWidth={3} />
            </button>
          )}

          {!isCompleted && habit.unitType && habit.unitType !== 'simple' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd?.(e);
              }}
              className="w-9 h-9 rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
              title="Add progress"
            >
              <Plus className="w-5 h-5" strokeWidth={3} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickComplete?.(e);
            }}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95',
              isCompleted
                ? 'bg-white text-emerald-600'
                : 'bg-white/80 dark:bg-zinc-800 text-gray-500 hover:bg-white'
            )}
          >
            <Check className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
