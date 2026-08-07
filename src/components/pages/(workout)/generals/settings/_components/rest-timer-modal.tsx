'use client';

import React, { useState, useEffect } from 'react';
import { Hourglass, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSeconds: number;
  onSave: (seconds: number) => void;
}

export function RestTimerModal({
  isOpen,
  onClose,
  initialSeconds,
  onSave,
}: RestTimerModalProps) {
  const [seconds, setSeconds] = useState(initialSeconds || 180);

  useEffect(() => {
    setSeconds(initialSeconds || 180);
  }, [initialSeconds, isOpen]);

  if (!isOpen) return null;

  // Format seconds to M:SS (e.g. 180 -> "3:00", 90 -> "1:30")
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins}:${remainderSecs < 10 ? '0' : ''}${remainderSecs}`;
  };

  const handleIncrement = () => {
    setSeconds((prev) => Math.min(600, prev + 15)); // max 10 mins
  };

  const handleDecrement = () => {
    setSeconds((prev) => Math.max(15, prev - 15)); // min 15 secs
  };

  const handleSave = () => {
    onSave(seconds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all animate-in fade-in">
      <div
        className="w-full max-w-md bg-zinc-900 text-white rounded-t-[32px] sm:rounded-[32px] p-6 space-y-6 shadow-2xl border border-zinc-800 animate-in slide-in-from-bottom-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300">
              <Hourglass className="w-5 h-5 text-zinc-200" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-white mt-3">
              Rest timer
            </h3>
            <p className="text-xs font-medium text-zinc-400 leading-relaxed max-w-xs">
              Set how much you want to rest between two sets for this workout.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Counter Section */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-extrabold uppercase text-zinc-500 tracking-wider">
            Minutes
          </span>

          <div className="py-6 px-4 bg-zinc-950/60 rounded-3xl border border-zinc-800/80 flex items-center justify-between">
            {/* Decrement Button */}
            <button
              type="button"
              onClick={handleDecrement}
              disabled={seconds <= 15}
              className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold disabled:opacity-30 transition-all active:scale-95 shadow-sm"
            >
              <Minus className="w-5 h-5" />
            </button>

            {/* Main Digital Time Display */}
            <span className="text-5xl font-black tracking-tight text-white tabular-nums px-4">
              {formatTime(seconds)}
            </span>

            {/* Increment Button */}
            <button
              type="button"
              onClick={handleIncrement}
              disabled={seconds >= 600}
              className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold disabled:opacity-30 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Select Preset Chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[30, 60, 90, 120, 180, 300].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeconds(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold transition-all border',
                seconds === s
                  ? 'bg-white text-zinc-950 border-white font-extrabold shadow-sm scale-105'
                  : 'bg-zinc-800/70 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
              )}
            >
              {formatTime(s)}
            </button>
          ))}
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-4 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-black text-base transition-all shadow-lg active:scale-[0.99]"
        >
          Save
        </button>
      </div>
    </div>
  );
}
