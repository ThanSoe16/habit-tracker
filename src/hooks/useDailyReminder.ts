'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUserStore } from '@/store/useUserStore';

const NOTIFICATION_KEY = 'last-daily-reminder-date';

export function useDailyReminder() {
  const { remindersEnabled, dailyReminderTime, name } = useUserStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // "Ding" sound parameters
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 1.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  const sendNotification = useCallback(() => {
    if (Notification.permission !== 'granted') return;

    // Don't send if already sent today
    const today = new Date().toDateString();
    const lastSent = localStorage.getItem(NOTIFICATION_KEY);
    if (lastSent === today) return;

    new Notification('Time for your habits! 💪', {
      body: `Hey ${name}, don't forget to complete your daily habits!`,
      icon: '/icon-192x192.png',
      tag: 'daily-reminder',
    });

    playNotificationSound();

    localStorage.setItem(NOTIFICATION_KEY, today);
  }, [name, playNotificationSound]);

  const checkAndNotify = useCallback(() => {
    if (!remindersEnabled) return;

    const now = new Date();
    const [hours, minutes] = dailyReminderTime.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = hours * 60 + minutes;

    // Send if we're within 1 minute of the target time
    if (currentMinutes >= targetMinutes && currentMinutes <= targetMinutes + 1) {
      sendNotification();
    }
  }, [remindersEnabled, dailyReminderTime, sendNotification]);

  useEffect(() => {
    if (!remindersEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Check immediately on mount
    checkAndNotify();

    // Check every 30 seconds
    intervalRef.current = setInterval(checkAndNotify, 30_000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [remindersEnabled, checkAndNotify]);

  return { requestPermission, playNotificationSound };
}
