'use client';

import { ChevronLeft, ChevronRight, Clock, Hash, CheckSquare, Timer } from 'lucide-react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[36px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Goal & Unit</h2>
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
                        : 'bg-gray-50 dark:bg-zinc-800/80 border-gray-100 dark:border-zinc-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center',
                          isSelected
                            ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/30'
                            : 'bg-white dark:bg-zinc-700 text-gray-500'
                        )}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      {isSelected && <span className="text-xs font-black text-blue-600 dark:text-blue-400">✓</span>}
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
                          ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/25'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Duration Value (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={goalValue || ''}
                  onChange={(e) => onChangeGoalValue(parseInt(e.target.value) || 1)}
                  placeholder="e.g., 20"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl font-bold text-lg border-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* TIME MODE CONFIGURATION */}
          {unitType === 'time' && (
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Time Unit
                </label>
                <div className="bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-2xl flex gap-1">
                  {[
                    { id: 'hr', label: 'Hours (hr)' },
                    { id: 'min', label: 'Minutes (min)' },
                    { id: 'sec', label: 'Seconds (sec)' },
                  ].map((tu) => (
                    <button
                      key={tu.id}
                      type="button"
                      onClick={() => onChangeTimeUnit?.(tu.id as any)}
                      className={cn(
                        'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all',
                        timeUnit === tu.id
                          ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/25'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                      )}
                    >
                      {tu.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Target Time Goal ({timeUnit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={goalValue || ''}
                  onChange={(e) => onChangeGoalValue(parseInt(e.target.value) || 1)}
                  placeholder="e.g., 30"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl font-bold text-lg border-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
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
            className="w-full py-3.5 rounded-2xl bg-[#2563eb] text-white font-bold text-sm shadow-lg shadow-blue-500/30"
          >
            Save Goal Settings
          </button>
        </div>
      </div>
    </div>
  );
}
