'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Hourglass, Pause, Play, Plus, X, SkipForward, Volume2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RestTimerCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName?: string;
  initialSeconds?: number;
}

export function RestTimerCountdownModal({
  isOpen,
  onClose,
  exerciseName = 'Exercise',
  initialSeconds = 180,
}: RestTimerCountdownModalProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const totalDurationRef = useRef(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    totalDurationRef.current = initialSeconds;
    setIsRunning(true);
    setIsMinimized(false);
  }, [initialSeconds, isOpen]);

  // Audio Beep when countdown hits 0
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Audio fallback silent
    }
  };

  useEffect(() => {
    if (!isOpen || !isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins}:${remainderSecs < 10 ? '0' : ''}${remainderSecs}`;
  };

  const handleAdd30s = () => {
    setTimeLeft((prev) => prev + 30);
    totalDurationRef.current += 30;
  };

  const progressPercent =
    totalDurationRef.current > 0
      ? Math.max(0, Math.min(100, (timeLeft / totalDurationRef.current) * 100))
      : 0;

  // Floating Minimized Pill View
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50 bg-zinc-900 text-white rounded-full px-4 py-2.5 shadow-2xl border border-zinc-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2">
          <Hourglass className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-sm font-black tabular-nums">{formatTime(timeLeft)}</span>
        </div>

        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xs"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="text-xs font-bold text-blue-400 hover:underline px-1"
        >
          Expand
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Full Overlay / Sheet View
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all animate-in fade-in">
      <div
        className="w-full max-w-md bg-zinc-900 text-white rounded-t-[36px] sm:rounded-[36px] p-6 space-y-6 shadow-2xl border border-zinc-800 animate-in slide-in-from-bottom-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Hourglass className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Rest Timer</h3>
              <p className="text-xs text-zinc-400 truncate max-w-[200px]" title={exerciseName}>
                {exerciseName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              Minimize
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circular Ring Timer Display */}
        <div className="flex flex-col items-center justify-center py-4 relative">
          <div className="w-52 h-52 rounded-full relative flex items-center justify-center bg-zinc-950/80 border-4 border-zinc-800 shadow-inner">
            {/* SVG Ring Progress */}
            <svg className="w-full h-full transform -rotate-90 absolute inset-0">
              <circle
                cx="104"
                cy="104"
                r="92"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-800"
                fill="transparent"
              />
              <circle
                cx="104"
                cy="104"
                r="92"
                stroke="currentColor"
                strokeWidth="8"
                className="text-blue-500 transition-all duration-1000 ease-linear"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 92}
                strokeDashoffset={2 * Math.PI * 92 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>

            {/* Time Text */}
            <div className="text-center z-10 space-y-1">
              <span className="text-5xl font-black tracking-tighter text-white tabular-nums block">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">
                {timeLeft === 0 ? 'Rest Complete! 🎉' : 'Resting'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* Pause / Resume */}
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border border-zinc-700/60"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-400" /> Resume
              </>
            )}
          </button>

          {/* +30 Seconds */}
          <button
            type="button"
            onClick={handleAdd30s}
            className="py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-zinc-700/60"
          >
            <Plus className="w-4 h-4 text-blue-400" /> +30s
          </button>

          {/* Skip Rest */}
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-blue-500/20"
          >
            <SkipForward className="w-4 h-4" /> Skip
          </button>
        </div>
      </div>
    </div>
  );
}
