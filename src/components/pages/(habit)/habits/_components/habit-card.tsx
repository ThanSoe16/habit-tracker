'use client';

import { useRef, useCallback } from 'react';
import { Check, Flame, Plus, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Habit } from '@/store/use-habit-store';
import { parseTimeTakenToSeconds, formatTimeTakenDisplay } from '@/utils/time-utils';
import { HabitDirectionBadge } from '@/components/pages/(habit)/_components/habit-direction-badge';
import { parseHabitCount } from '@/features/habits/utils/progress';

interface HabitCardProps {
  habit: Habit;
  date: Date;
  isLast?: boolean;
  cardStyle?: 'compact' | 'detailed';
  showStreakBadges?: boolean;
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
  cardStyle = 'detailed',
  showStreakBadges = true,
  onClick,
  onLongPress,
  onQuickAdd,
  onQuickSubtract,
  onQuickComplete,
}: HabitCardProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const dateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const historyEntry = habit.history[dateString];
  const isCompleted = typeof historyEntry === 'boolean' ? historyEntry : historyEntry?.completed;
  const timeTaken = typeof historyEntry === 'object' ? historyEntry?.timeTaken : undefined;
  const count = typeof historyEntry === 'object' ? historyEntry?.count : undefined;

  const unitLabel = habit.unit || (habit.unitType === 'time' ? 'mins' : 'times');

  const currentProgress = () => {
    if (habit.unitType === 'count') {
      const current = parseHabitCount(count);
      return `${current} / ${habit.goalValue || 1} ${unitLabel}`;
    }
    if (habit.unitType === 'time') {
      const current = formatTimeTakenDisplay(timeTaken);
      return `${current} / ${habit.goalValue || 1} ${habit.timeUnit || 'min'}`;
    }
    if (habit.unitType === 'duration') {
      const current = formatTimeTakenDisplay(timeTaken);
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
    if (!isLongPressRef.current) {
      onClick?.();
    }
    isLongPressRef.current = false;
  }, [onClick]);

  const habitColor = habit.color || '#2563eb';

  let pct = 0;
  if (isCompleted) {
    pct = 100;
  } else if (habit.unitType === 'count') {
    const current = parseHabitCount(count);
    pct = Math.min(100, Math.max(0, (current / (habit.goalValue || 1)) * 100));
  } else if (habit.unitType === 'time' || habit.unitType === 'duration') {
    const currentSecs = parseTimeTakenToSeconds(timeTaken);
    const isGoalInHours = habit.timeUnit === 'hr';
    const goalSecs = (habit.goalValue || 1) * (isGoalInHours ? 3600 : 60);
    pct = Math.min(100, Math.max(0, (currentSecs / (goalSecs || 1)) * 100));
  }

  const isCompact = cardStyle === 'compact';

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
      {/* Card Body Container */}
      <div
        className={cn(
          'relative flex-1 flex items-center justify-between overflow-hidden shadow-xs hover:shadow-md transition-all border border-black/5',
          isCompact ? 'rounded-xl p-2.5' : 'rounded-2xl p-3.5',
        )}
        style={{
          backgroundColor: isCompleted ? habitColor : `${habitColor}22`,
        }}
      >
        {/* Progress Overlay Fill */}
        {!isCompleted && pct > 0 && (
          <div
            className={cn(
              'absolute left-0 top-0 bottom-0 transition-all duration-300',
              isCompact ? 'rounded-xl' : 'rounded-2xl',
            )}
            style={{
              width: `${pct}%`,
              backgroundColor: habitColor,
            }}
          />
        )}

        {/* Content Container */}
        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3">
          {/* Icon Box */}
          <div
            className={cn(
              'rounded-xl flex items-center justify-center shrink-0 shadow-xs',
              isCompact ? 'w-8 h-8 text-base' : 'w-10 h-10 text-xl',
            )}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
            }}
          >
            {habit.emoji || habit.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            <h3
              className={cn(
                'truncate font-black leading-snug',
                isCompact ? 'text-xs' : 'text-sm',
                pct > 50 || isCompleted ? 'text-white' : 'text-gray-900 dark:text-white',
              )}
            >
              {habit.name}
            </h3>
            {(habit.type !== 'task' || !isCompact) && (
              <div className="flex min-w-0 items-center gap-1.5">
                {habit.type !== 'task' && (
                  <HabitDirectionBadge habitKind={habit.habitKind} />
                )}
                {!isCompact && (
                  <p
                    className={cn(
                      'min-w-0 truncate text-xs font-semibold',
                      pct > 50 || isCompleted
                        ? 'text-white/80'
                        : 'text-gray-500 dark:text-gray-400',
                    )}
                  >
                    {currentProgress() ||
                      (habit.habitKind === 'quit'
                        ? isCompleted
                          ? 'Avoided today'
                          : 'Stay on track today'
                        : habit.timeOfDay
                          ? `${habit.timeOfDay} routine`
                          : 'Every day')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls & Streak Badge */}
        <div className="relative z-10 flex shrink-0 items-center gap-2">
          {/* Streak Counter */}
          {showStreakBadges && (
            <div
              className={cn(
                'flex items-center gap-0.5 text-[11px] font-black',
                pct > 50 || isCompleted ? 'text-white/90' : 'text-gray-600 dark:text-gray-300',
              )}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{habit.streak || 1}</span>
            </div>
          )}

          {/* Action Buttons */}
          {!isCompleted && habit.unitType === 'count' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickSubtract?.(e);
              }}
              className={cn(
                'rounded-full bg-white/90 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs',
                isCompact ? 'w-7 h-7' : 'w-9 h-9',
              )}
              title="Subtract count"
            >
              <Minus className={isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} strokeWidth={3} />
            </button>
          )}

          {!isCompleted && habit.unitType && habit.unitType !== 'simple' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd?.(e);
              }}
              className={cn(
                'rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md',
                isCompact ? 'w-7 h-7' : 'w-9 h-9',
              )}
              title="Add progress"
            >
              <Plus className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={3} />
            </button>
          )}

          <button
            type="button"
            title={habit.habitKind === 'quit' ? 'I avoided this today' : 'Mark completed'}
            onClick={(e) => {
              e.stopPropagation();
              onQuickComplete?.(e);
            }}
            className={cn(
              'rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95',
              isCompact ? 'w-7 h-7' : 'w-9 h-9',
              isCompleted
                ? 'bg-white text-emerald-600'
                : 'bg-white/80 dark:bg-zinc-800 text-gray-500 hover:bg-white',
            )}
          >
            <Check className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
