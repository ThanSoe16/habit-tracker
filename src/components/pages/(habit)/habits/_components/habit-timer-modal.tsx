'use client';

import { useHabitTimer } from '@/features/habits/hooks/use-habit-timer';
import { Play, Pause, RotateCcw, FastForward, X, Plus, Minus } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Flex } from '@radix-ui/themes';
import { HabitSheetBody, HabitSheetButton, HabitSheetHeader } from './habit-sheet-layout';
import { cn } from '@/utils/cn';
import type { Habit } from '@/store/use-habit-store';

import { formatTimeTakenDisplay as formatMinSec } from '@/utils/time-utils';
import {
  getInitialTimerSeconds,
  getTimerProgress,
  formatRemainingTimerTime,
} from '@/features/habits/utils/timer-progress';

interface HabitTimerModalProps {
  habit: Habit;
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  onSaveProgress: (id: string, dateStr: string, timeTakenStr: string, completed: boolean) => void;
}

function TimerInnerForm({
  habit,
  date,
  onClose,
  onSaveProgress,
}: Omit<HabitTimerModalProps, 'isOpen'>) {
  const dateString = date.toLocaleDateString('en-CA');
  const historyEntry = habit.history[dateString];
  const goalValue = habit.goalValue || 10;
  const isCountDown = habit.timerMode === 'down';
  const totalGoalSeconds =
    goalValue * (habit.timeUnit === 'hr' ? 3600 : habit.timeUnit === 'sec' ? 1 : 60);
  const initialSecs = getInitialTimerSeconds(
    typeof historyEntry === 'object' ? historyEntry?.timeTaken : undefined,
    totalGoalSeconds,
    isCountDown,
  );

  const { seconds, isRunning, toggleRunning, reset, adjustMinute } = useHabitTimer(
    initialSecs,
    totalGoalSeconds,
    isCountDown,
  );
  const progress = getTimerProgress(seconds, totalGoalSeconds, isCountDown);
  const { remainingSeconds, completedSeconds } = progress;

  const handleFinishSave = () => {
    onSaveProgress(habit.id, dateString, progress.timeTaken, progress.completed);
    onClose();
  };

  const strokeDashoffset = 283 - (283 * progress.percent) / 100;

  return (
    <HabitSheetBody>
      <HabitSheetHeader
        title={habit.name}
        description={
          <>
            Every day, {progress.timeTaken} / {goalValue} {habit.timeUnit || 'min'} completed
          </>
        }
      />

      <div className="relative mx-auto flex items-center justify-center w-full max-w-70 py-4">
        <button
          type="button"
          onClick={() => adjustMinute(-1)}
          aria-label="Decrease timer by one minute"
          className="absolute left-0 z-10 size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-transform"
        >
          <Minus className="w-6 h-6" strokeWidth={2.5} />
        </button>

        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-primary/15"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray="2 4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-primary transition-all duration-300"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn(
                'font-black tracking-tight text-foreground font-mono',
                formatMinSec(seconds).length > 5 ? 'text-3xl font-extrabold' : 'text-5xl',
              )}
            >
              {formatMinSec(seconds)}
            </span>
            <span className="text-xs text-muted-foreground">
              {isCountDown ? 'remaining' : 'completed'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => adjustMinute(1)}
          aria-label="Increase timer by one minute"
          className="absolute right-0 z-10 size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </div>

      <div className="w-full flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFinishSave}
            className="p-2 text-primary hover:scale-110 transition-transform"
            title="Fast forward / Complete"
          >
            <FastForward className="w-5 h-5 fill-current" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-primary hover:scale-110 transition-transform"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={reset}
            className="p-2 text-primary hover:scale-110 transition-transform"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleFinishSave}
          title="Click to save current progress"
          className="px-4 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer"
        >
          {remainingSeconds > 0 ? formatRemainingTimerTime(remainingSeconds) : 'Goal Reached!'}
        </button>
      </div>

      <Flex align="center" gap="3" width="100%" className="flex w-full items-center gap-3">
        <HabitSheetButton
          type="button"
          onClick={toggleRunning}
          disabled={isCountDown && seconds === 0 && !isRunning}
          variant={isRunning ? 'secondary' : 'default'}
          className="flex-1"
        >
          {isRunning ? (
            <>
              <Pause data-icon="inline-start" className="fill-current" />
              <span>Pause timer</span>
            </>
          ) : (
            <>
              <Play data-icon="inline-start" className="fill-current" />
              <span>
                {isCountDown && progress.completed
                  ? 'Timer complete'
                  : completedSeconds > 0
                    ? 'Resume timer'
                    : 'Start timer'}
              </span>
            </>
          )}
        </HabitSheetButton>

        <HabitSheetButton type="button" onClick={handleFinishSave} title="Save current progress">
          Save
        </HabitSheetButton>
      </Flex>
    </HabitSheetBody>
  );
}

export function HabitTimerModal({
  habit,
  date,
  isOpen,
  onClose,
  onSaveProgress,
}: HabitTimerModalProps) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        {isOpen && (
          <TimerInnerForm
            habit={habit}
            date={date}
            onClose={onClose}
            onSaveProgress={onSaveProgress}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}
