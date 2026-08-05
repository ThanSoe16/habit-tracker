'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, X, Plus, Minus } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/utils/cn';
import { Habit } from '@/store/use-habit-store';

import { parseTimeTakenToSeconds, formatTimeTakenDisplay } from '@/utils/time-utils';

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
}: {
  habit: Habit;
  date: Date;
  onClose: () => void;
  onSaveProgress: (id: string, dateStr: string, timeTakenStr: string, completed: boolean) => void;
}) {
  const dateString = date.toLocaleDateString('en-CA');
  const historyEntry = habit.history[dateString];
  let initialSecs = 0;
  if (typeof historyEntry === 'object' && historyEntry?.timeTaken) {
    initialSecs = parseTimeTakenToSeconds(historyEntry.timeTaken);
  }

  const goalMins = habit.goalValue || 10;
  const isCountDown = habit.timerMode === 'down';

  const [seconds, setSeconds] = useState(initialSecs);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Screen Wake Lock API support
  useEffect(() => {
    const requestWakeLock = async () => {
      if (isRunning && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.warn('Wake Lock request failed:', err);
        }
      }
    };

    if (isRunning) {
      requestWakeLock();
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isRunning]);

  // Timestamp-based Timer Interval with sleep drift compensation
  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const deltaSeconds = Math.round((now - (lastTimeRef.current || now)) / 1000);
        if (deltaSeconds >= 1) {
          lastTimeRef.current = now;
          setSeconds((prev) => {
            if (isCountDown) {
              if (prev <= deltaSeconds) {
                setIsRunning(false);
                return 0;
              }
              return prev - deltaSeconds;
            }
            return prev + deltaSeconds;
          });
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isCountDown]);

  const totalGoalSeconds = goalMins * 60;
  const remainingSeconds = Math.max(0, totalGoalSeconds - seconds);

  const formatMinSec = (secVal: number) => {
    return formatTimeTakenDisplay(secVal);
  };

  const formatRemainingPill = (secVal: number) => {
    const hours = Math.floor(secVal / 3600);
    const m = Math.floor((secVal % 3600) / 60);
    const s = secVal % 60;
    if (hours > 0) {
      return `+${hours} hr, ${m} min, ${s} sec`;
    }
    return `+${m} min, ${s} sec`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const handleAdjustMinute = (deltaMinutes: number) => {
    setSeconds((prev) => Math.max(0, prev + deltaMinutes * 60));
  };

  const handleFinishSave = () => {
    const timeTakenStr = formatMinSec(seconds);
    const isCompleted = seconds >= goalMins * 60;
    onSaveProgress(habit.id, dateString, timeTakenStr, isCompleted);
    onClose();
  };

  const progressPercent = Math.min(100, Math.max(0, (seconds / (totalGoalSeconds || 1)) * 100));
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className="px-6 pb-10 pt-2 flex flex-col items-center space-y-6">
      {/* Header Title & Subtitle */}
      <div className="text-center space-y-1">
        <DrawerTitle className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          {habit.name}
        </DrawerTitle>
        <p className="text-xs font-semibold text-gray-400">
          Every day, {formatMinSec(seconds)} / {habit.timeUnit === 'hr' ? `${goalMins} hr` : `${goalMins} minutes`}
        </p>
      </div>

      {/* CIRCULAR GAUGE DIAL WITH - AND + BUTTONS */}
      <div className="relative flex items-center justify-center w-full max-w-[280px] py-4">
        {/* Decrease 1 Min Button */}
        <button
          type="button"
          onClick={() => handleAdjustMinute(-1)}
          className="absolute left-0 z-10 w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-transform"
        >
          <Minus className="w-6 h-6" strokeWidth={2.5} />
        </button>

        {/* Circular Gauge Dial */}
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Ticks Pattern Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-emerald-100 dark:stroke-zinc-800"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray="2 4"
            />
            {/* Active Arc Fill */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-emerald-500 transition-all duration-300"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Digital Time Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn(
                'font-black tracking-tight text-gray-900 dark:text-white font-mono',
                formatMinSec(seconds).length > 5 ? 'text-3xl font-extrabold' : 'text-5xl',
              )}
            >
              {formatMinSec(seconds)}
            </span>
          </div>
        </div>

        {/* Increase 1 Min Button */}
        <button
          type="button"
          onClick={() => handleAdjustMinute(1)}
          className="absolute right-0 z-10 w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </div>

      {/* SECONDARY ACTION ROW (Skip, Close, Reset, Remaining Goal Pill) */}
      <div className="w-full flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFinishSave}
            className="p-2 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
            title="Fast forward / Complete"
          >
            <FastForward className="w-5 h-5 fill-current" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Remaining Goal Pill / Save Trigger */}
        <button
          type="button"
          onClick={handleFinishSave}
          title="Click to save current progress"
          className="px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
        >
          {remainingSeconds > 0 ? formatRemainingPill(remainingSeconds) : 'Goal Reached!'}
        </button>
      </div>

      {/* PRIMARY ACTION BUTTONS (Start/Pause Timer + Save Progress) */}
      <div className="flex items-center gap-3 w-full">
        <button
          type="button"
          onClick={handleStartPause}
          className={cn(
            'flex-1 py-4 rounded-3xl text-white font-black text-base flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-98',
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
              : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30',
          )}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause timer</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>{seconds > 0 ? 'Resume timer' : 'Start timer'}</span>
            </>
          )}
        </button>

        {seconds > 0 && (
          <button
            type="button"
            onClick={handleFinishSave}
            className="py-4 px-6 rounded-3xl bg-indigo-600 hover:bg-indigo-600 text-white font-black text-base shadow-xl shadow-indigo-500/30 active:scale-98 transition-all shrink-0"
            title="Save current progress"
          >
            Save
          </button>
        )}
      </div>
    </div>
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
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="p-0" />
          {isOpen && (
            <TimerInnerForm
              habit={habit}
              date={date}
              onClose={onClose}
              onSaveProgress={onSaveProgress}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
