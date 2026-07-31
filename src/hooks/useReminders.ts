'use client';

import { useEffect, useRef } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { useUserStore, RingtoneType } from '@/store/useUserStore';
import { isHabitRequiredOnDate, getLocalDateString } from '@/utils/dateUtils';
import { normalize24HourTime } from '@/utils/timeUtils';

/**
 * Plays an audio alarm chime / sound using Web Audio API or custom URL.
 */
export function playAlarmSound(ringtoneType?: RingtoneType, customUrl?: string) {
  const { ringtone: storeRingtone, customRingtoneUrl: storeCustomUrl, vibrationEnabled } = useUserStore.getState();
  const selectedType = ringtoneType || storeRingtone || 'chime';
  const customAudioUrl = customUrl || storeCustomUrl;

  // Trigger vibration if enabled and supported by browser/device
  if (vibrationEnabled && typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 400]);
    } catch (e) {
      console.error('Vibration error:', e);
    }
  }

  if (selectedType === 'custom' && customAudioUrl) {
    try {
      const audio = new Audio(customAudioUrl);
      audio.play().catch((e) => console.error('Custom ringtone error:', e));
      return;
    } catch (e) {
      console.error('Custom audio error:', e);
    }
  }

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (selectedType === 'marimba') {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } else if (selectedType === 'radar') {
      const times = [0, 0.15];
      times.forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880; // A5

        const startTime = ctx.currentTime + t;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.1);
      });
    } else if (selectedType === 'digital') {
      const notes = [1200, 1500, 1200, 1500];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * 0.1;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.08);
      });
    } else {
      // Default Chime
      const notes = [659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * 0.18;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    }
  } catch (e) {
    console.error('Audio play error:', e);
  }
}

/**
 * Hook that checks every 15 seconds if any habit has a reminder due.
 * Fires a browser notification & plays an alarm ringtone if due.
 */
export function useReminders() {
  const { habits } = useHabitStore();
  const { remindersEnabled, setRemindersEnabled } = useUserStore();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasAnyReminder = habits.some((h) => !!h.reminderTime);

    if (hasAnyReminder) {
      if (!remindersEnabled) {
        setRemindersEnabled(true);
      }
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [habits, remindersEnabled, setRemindersEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = getLocalDateString(now);

      habits.forEach((habit) => {
        if (!habit.reminderTime) return;

        const normReminder = normalize24HourTime(habit.reminderTime);
        if (normReminder !== currentTime) return;

        const notifyKey = `${habit.id}_${todayStr}_${normReminder}`;
        if (notifiedRef.current.has(notifyKey)) return;

        if (!isHabitRequiredOnDate(habit, now)) return;

        const entry = habit.history[todayStr];
        const isDone = typeof entry === 'boolean' ? entry : entry?.completed;
        if (isDone) return;

        notifiedRef.current.add(notifyKey);

        // Play alarm sound
        playAlarmSound();

        // Fire browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`Habit Alarm ⏰`, {
              body: `Time for: ${habit.emoji || '📋'} ${habit.name}`,
              icon: '/favicon.ico',
              tag: notifyKey,
            });
          } catch (e) {
            console.error('Browser Notification error:', e);
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15_000);

    return () => clearInterval(interval);
  }, [habits]);
}
