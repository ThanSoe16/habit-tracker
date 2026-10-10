'use client';

import { useState, useEffect, useRef } from 'react';
import { advanceHabitTimer, getTimerProgress } from '../utils/timer-progress';
import { createTimerSound } from '../utils/timer-sound';

export function useHabitTimer(initialSeconds: number, goalSeconds: number, isCountDown: boolean) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const soundRef = useRef<ReturnType<typeof createTimerSound> | null>(null);
  const notifiedRef = useRef(getTimerProgress(initialSeconds, goalSeconds, isCountDown).completed);

  // Screen Wake Lock API support
  useEffect(() => {
    const requestWakeLock = async () => {
      if (isRunning && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
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

  useEffect(
    () => () => {
      soundRef.current?.dispose();
      soundRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (!isRunning) return;
    const timeout = setTimeout(() => {
      const next = advanceHabitTimer(seconds, goalSeconds, isCountDown);
      setSeconds(next.seconds);
      if (isCountDown && next.seconds === 0) setIsRunning(false);
      if (next.reachedGoal && !notifiedRef.current) {
        notifiedRef.current = true;
        soundRef.current?.play();
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [seconds, isRunning, isCountDown, goalSeconds]);

  const toggleRunning = () => {
    if (!isRunning) {
      soundRef.current ??= createTimerSound();
      soundRef.current.prepare();
    }
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setSeconds(isCountDown ? goalSeconds : 0);
    notifiedRef.current = false;
    soundRef.current?.dispose();
    soundRef.current = null;
  };

  const adjustMinute = (deltaMinutes: number) => {
    const adjusted = Math.max(0, seconds + deltaMinutes * 60);
    const next = isCountDown ? Math.min(goalSeconds, adjusted) : adjusted;
    if (!getTimerProgress(next, goalSeconds, isCountDown).completed) notifiedRef.current = false;
    setSeconds(next);
  };

  return { seconds, isRunning, toggleRunning, reset, adjustMinute };
}
