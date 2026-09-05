'use client';
import { useCallback, useEffect } from 'react';
import { useUserStore } from '@/store/use-user-store';
import { playAlarmSound } from '@/hooks/use-reminders';

export function useDailyReminder() {
  const {
    remindersEnabled,
    dailyReminderTime,
    moodSettings,
    name,
    ringtone,
    customRingtoneUrl,
    vibrationEnabled,
    isLoaded,
  } = useUserStore();
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return false;
    return (
      (Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission) === 'granted'
    );
  }, []);
  const playNotificationSound = useCallback(() => {
    playAlarmSound(ringtone, customRingtoneUrl);
  }, [ringtone, customRingtoneUrl]);
  const notify = useCallback(
    async (title: string, body: string, tag: string) => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted')
        return false;
      try {
        const registration =
          'serviceWorker' in navigator
            ? await navigator.serviceWorker.getRegistration()
            : undefined;
        const options = { body, icon: '/icon-192x192.png', tag };
        if (registration) await registration.showNotification(title, options);
        else new Notification(title, options);
        playNotificationSound();
        if (vibrationEnabled && typeof navigator.vibrate === 'function') navigator.vibrate(150);
        return true;
      } catch {
        return false;
      }
    },
    [playNotificationSound, vibrationEnabled],
  );
  useEffect(() => {
    if (!isLoaded) return;
    let checking = false;
    const check = async () => {
      if (checking || typeof Notification === 'undefined' || Notification.permission !== 'granted')
        return;
      checking = true;
      try {
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        for (const reminder of [
          {
            enabled: remindersEnabled,
            time: dailyReminderTime,
            key: 'last-daily-reminder-date',
            title: 'Time for your habits!',
            body: `Hey ${name}, remember your daily habits.`,
            tag: 'daily-reminder',
          },
          {
            enabled: moodSettings.remindersEnabled,
            time: moodSettings.reminderTime,
            key: 'last-mood-reminder-date',
            title: 'How are you feeling?',
            body: 'Take a moment to check in with your mood.',
            tag: 'mood-reminder',
          },
        ]) {
          if (!reminder.enabled) continue;
          const [hours, minute] = reminder.time.split(':').map(Number);
          if (minutes < hours * 60 + minute || minutes > hours * 60 + minute + 1) continue;
          if (localStorage.getItem(reminder.key) === now.toDateString()) continue;
          if (await notify(reminder.title, reminder.body, reminder.tag))
            localStorage.setItem(reminder.key, now.toDateString());
        }
      } catch {
        /* A browser may block local storage; skip this reminder attempt. */
      } finally {
        checking = false;
      }
    };
    void check();
    const timer = setInterval(() => void check(), 30_000);
    return () => clearInterval(timer);
  }, [
    isLoaded,
    remindersEnabled,
    dailyReminderTime,
    moodSettings.remindersEnabled,
    moodSettings.reminderTime,
    name,
    notify,
  ]);
  const sendTestNotification = useCallback(
    () =>
      notify('Test notification', `This is a test notification for ${name}.`, 'test-notification'),
    [notify, name],
  );
  return { requestPermission, playNotificationSound, sendTestNotification };
}
