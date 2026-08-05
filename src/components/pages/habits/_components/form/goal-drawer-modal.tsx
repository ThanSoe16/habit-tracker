import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Hash, CheckSquare, Timer, Plus, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface GoalDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitType: 'simple' | 'duration' | 'time' | 'count';
  timerMode?: 'down' | 'up';
  timeUnit?: 'hr' | 'min' | 'sec';
  goalValue: number;
  unit: string;
  onChangeUnitType: (type: 'simple' | 'duration' | 'time' | 'count') => void;
  onChangeTimerMode?: (mode: 'down' | 'up') => void;
  onChangeTimeUnit?: (tu: 'hr' | 'min' | 'sec') => void;
  onChangeGoalValue: (val: number) => void;
  onOpenUnitSelector: () => void;
}

function TimePickerSection({
  timeUnit = 'min',
  goalValue,
  onChangeTimeUnit,
  onChangeGoalValue,
}: {
  timeUnit?: 'hr' | 'min' | 'sec';
  goalValue: number;
  onChangeTimeUnit?: (tu: 'hr' | 'min' | 'sec') => void;
  onChangeGoalValue: (val: number) => void;
}) {
  let initialH = 0;
  let initialM = 0;
  let initialS = 0;

  if (timeUnit === 'hr') {
    initialH = goalValue || 1;
  } else if (timeUnit === 'sec') {
    initialH = Math.floor((goalValue || 0) / 3600);
    initialM = Math.floor(((goalValue || 0) % 3600) / 60);
    initialS = (goalValue || 0) % 60;
  } else {
    initialH = Math.floor((goalValue || 0) / 60);
    initialM = (goalValue || 0) % 60;
    if (initialH === 0 && initialM === 0) initialM = goalValue || 10;
  }

  const [hours, setHours] = useState(initialH);
  const [mins, setMins] = useState(initialM);
  const [secs, setSecs] = useState(initialS);

  useEffect(() => {
    let h = 0;
    let m = 0;
    let s = 0;
    if (timeUnit === 'hr') {
      h = goalValue || 1;
    } else if (timeUnit === 'sec') {
      h = Math.floor((goalValue || 0) / 3600);
      m = Math.floor(((goalValue || 0) % 3600) / 60);
      s = (goalValue || 0) % 60;
    } else {
      h = Math.floor((goalValue || 0) / 60);
      m = (goalValue || 0) % 60;
      if (h === 0 && m === 0) m = goalValue || 10;
    }
    setHours(h);
    setMins(m);
    setSecs(s);
  }, [goalValue, timeUnit]);

  const updateGoal = (h: number, m: number, s: number) => {
    setHours(h);
    setMins(m);
    setSecs(s);

    if (h > 0) {
      const totalMinutes = h * 60 + m;
      onChangeTimeUnit?.('min');
      onChangeGoalValue(totalMinutes);
    } else {
      onChangeTimeUnit?.('min');
      onChangeGoalValue(m || 1);
    }
  };

  const handleAdjust = (type: 'h' | 'm' | 's', delta: number) => {
    let newH = hours;
    let newM = mins;
    let newS = secs;

    if (type === 'h') {
      newH = Math.max(0, Math.min(23, hours + delta));
    } else if (type === 'm') {
      newM = mins + delta;
      if (newM >= 60) {
        newH += Math.floor(newM / 60);
        newM = newM % 60;
      } else if (newM < 0) {
        if (newH > 0) {
          newH -= 1;
          newM += 60;
        } else {
          newM = 0;
        }
      }
    } else if (type === 's') {
      newS = secs + delta;
      if (newS >= 60) {
        newM += Math.floor(newS / 60);
        newS = newS % 60;
        if (newM >= 60) {
          newH += Math.floor(newM / 60);
          newM = newM % 60;
        }
      } else if (newS < 0) {
        if (newM > 0) {
          newM -= 1;
          newS += 60;
        } else if (newH > 0) {
          newH -= 1;
          newM = 59;
          newS += 60;
        } else {
          newS = 0;
        }
      }
    }

    updateGoal(newH, newM, newS);
  };

  const applyPreset = (preset: { h: number; m: number; s: number }) => {
    updateGoal(preset.h, preset.m, preset.s);
  };

  const formattedTimeDisplay = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
      {/* Target Time Picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Target Time Goal
          </label>
          <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/40">
            {formattedTimeDisplay}
          </span>
        </div>

        {/* 3 Column Time Stepper Picker */}
        <div className="p-4 rounded-3xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 flex items-center justify-center gap-2">
          {/* Hours Column */}
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[84px]">
            <button
              type="button"
              onClick={() => handleAdjust('h', 1)}
              className="w-full py-2 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-xl text-gray-700 dark:text-gray-200 flex items-center justify-center shadow-xs active:scale-95 transition-all font-black text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => {
                const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                updateGoal(h, mins, secs);
              }}
              className="w-full h-14 bg-white dark:bg-zinc-900 text-center font-mono font-black text-2xl text-gray-900 dark:text-white rounded-2xl border-2 border-gray-100 dark:border-zinc-700 focus:border-blue-500 focus:outline-none shadow-xs"
            />
            <button
              type="button"
              onClick={() => handleAdjust('h', -1)}
              className="w-full py-2 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-xl text-gray-700 dark:text-gray-200 flex items-center justify-center shadow-xs active:scale-95 transition-all font-black text-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-gray-400">Hours</span>
          </div>

          <span className="text-2xl font-black text-gray-300 dark:text-zinc-600 mb-5">:</span>

          {/* Minutes Column */}
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[84px]">
            <button
              type="button"
              onClick={() => handleAdjust('m', 5)}
              className="w-full py-2 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-xl text-gray-700 dark:text-gray-200 flex items-center justify-center shadow-xs active:scale-95 transition-all font-black text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="0"
              max="59"
              value={mins}
              onChange={(e) => {
                const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                updateGoal(hours, m, secs);
              }}
              className="w-full h-14 bg-white dark:bg-zinc-900 text-center font-mono font-black text-2xl text-gray-900 dark:text-white rounded-2xl border-2 border-gray-100 dark:border-zinc-700 focus:border-blue-500 focus:outline-none shadow-xs"
            />
            <button
              type="button"
              onClick={() => handleAdjust('m', -5)}
              className="w-full py-2 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-xl text-gray-700 dark:text-gray-200 flex items-center justify-center shadow-xs active:scale-95 transition-all font-black text-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-gray-400">Minutes</span>
          </div>

          <span className="text-2xl font-black text-gray-300 dark:text-zinc-600 mb-5">:</span>

          {/* Seconds Column */}
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[84px]">
            <button
              type="button"
              onClick={() => handleAdjust('s', 15)}
              className="w-full py-2 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-xl text-gray-700 dark:text-gray-200 flex items-center justify-center shadow-xs active:scale-95 transition-all font-black text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="0"
              max="59"
              value={secs}
              onChange={(e) => {
                const s = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                updateGoal(hours, mins, s);
              }}
              className="w-full h-14 bg-white dark:bg-zinc-900 text-center font-mono font-black text-2xl text-gray-900 dark:text-white rounded-2xl border-2 border-gray-100 dark:border-zinc-700 focus:border-blue-500 focus:outline-none shadow-xs"
            />
            <button
              type="button"
              onClick={() => handleAdjust('s', -15)}
              className="w-full py-2 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-xl text-gray-700 dark:text-gray-200 flex items-center justify-center shadow-xs active:scale-95 transition-all font-black text-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-gray-400">Seconds</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { label: '15m', h: 0, m: 15, s: 0, tu: 'min' as const },
            { label: '30m', h: 0, m: 30, s: 0, tu: 'min' as const },
            { label: '45m', h: 0, m: 45, s: 0, tu: 'min' as const },
            { label: '1h', h: 1, m: 0, s: 0, tu: 'hr' as const },
            { label: '1.5h', h: 1, m: 30, s: 0, tu: 'hr' as const },
            { label: '2h', h: 2, m: 0, s: 0, tu: 'hr' as const },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors shrink-0"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';

export function GoalDrawerModal({
  isOpen,
  onClose,
  unitType,
  timerMode = 'down',
  timeUnit = 'min',
  goalValue,
  unit,
  onChangeUnitType,
  onChangeTimerMode,
  onChangeTimeUnit,
  onChangeGoalValue,
  onOpenUnitSelector,
}: GoalDrawerModalProps) {
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
          <DrawerTitle className="text-lg font-black text-gray-900 dark:text-white">Goal & Unit</DrawerTitle>
          <div className="w-10 h-10" />
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Measurement Type Cards Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Measurement Mode
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  id: 'simple',
                  title: 'Yes / No',
                  desc: 'Done / Undone + Remark',
                  icon: CheckSquare,
                },
                {
                  id: 'duration',
                  title: 'Duration',
                  desc: 'Timer (Count Down / Up)',
                  icon: Timer,
                },
                {
                  id: 'time',
                  title: 'Time',
                  desc: 'Hours, Minutes, Seconds',
                  icon: Clock,
                },
                {
                  id: 'count',
                  title: 'Count',
                  desc: 'Incremental (+ / -)',
                  icon: Hash,
                },
              ].map((item) => {
                const IconComp = item.icon;
                const isSelected = unitType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeUnitType(item.id as any)}
                    className={cn(
                      'p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3',
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                        : 'bg-gray-50 dark:bg-zinc-800/80 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100',
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center',
                          isSelected
                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                            : 'bg-white dark:bg-zinc-700 text-gray-500',
                        )}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DURATION MODE CONFIGURATION */}
          {unitType === 'duration' && (
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Timer Direction
                </label>
                <div className="bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-2xl flex gap-1">
                  {[
                    { id: 'down', label: 'Count Down (Timer)' },
                    { id: 'up', label: 'Count Up (Stopwatch)' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onChangeTimerMode?.(t.id as any)}
                      className={cn(
                        'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all',
                        timerMode === t.id
                          ? 'bg-primary text-white shadow-md shadow-primary/25'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800',
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <TimePickerSection
                timeUnit={timeUnit}
                goalValue={goalValue}
                onChangeTimeUnit={onChangeTimeUnit}
                onChangeGoalValue={onChangeGoalValue}
              />
            </div>
          )}

          {/* TIME MODE CONFIGURATION */}
          {unitType === 'time' && (
            <TimePickerSection
              timeUnit={timeUnit}
              goalValue={goalValue}
              onChangeTimeUnit={onChangeTimeUnit}
              onChangeGoalValue={onChangeGoalValue}
            />
          )}

          {/* COUNT MODE CONFIGURATION */}
          {unitType === 'count' && (
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Daily Goal Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={goalValue || ''}
                  onChange={(e) => onChangeGoalValue(parseInt(e.target.value) || 1)}
                  placeholder="e.g., 8"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl font-bold text-lg border-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Unit Name
                </label>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUnitSelector();
                  }}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700/60 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{unit}</span>
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold">
                    <span>Change Unit</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30"
          >
            Save Goal Settings
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
