'use client';

import { useEffect, useRef } from 'react';
import { useHabitStore } from '@/store/use-habit-store';
import { useUserStore } from '@/store/use-user-store';
import { isHabitRequiredOnDate, getLocalDateString } from '@/utils/date-utils';
import { normalize24HourTime } from '@/utils/time-utils';
import { toast } from 'sonner';
import {
  clearHabitSnooze,
  getHabitSnoozedUntil,
  snoozeHabitReminder,
} from '@/features/habits/services/reminder-snooze';

import { playAlarmSound } from '../utils/alarm-sound';
export { playAlarmSound } from '../utils/alarm-sound';

/**
 * Hook that checks every 15 seconds if any habit has a reminder due.
 * Fires a browser notification & plays an alarm ringtone if due.
 */
export function useHabitReminders() {
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
        const snoozedUntil = getHabitSnoozedUntil(habit.id, todayStr);
        const isScheduledTime = normReminder === currentTime;
        const isSnoozeDue = Boolean(snoozedUntil && now.getTime() >= snoozedUntil);

        if (!isScheduledTime && !isSnoozeDue) return;
        if (isScheduledTime && snoozedUntil && now.getTime() < snoozedUntil) return;

        const dueKey = isSnoozeDue ? snoozedUntil : normReminder;
        const notifyKey = `${habit.id}_${todayStr}_${dueKey}`;
        if (notifiedRef.current.has(notifyKey)) return;

        if (!isHabitRequiredOnDate(habit, now)) return;

        const entry = habit.history[todayStr];
        const isDone = typeof entry === 'boolean' ? entry : entry?.completed;
        if (isDone) {
          clearHabitSnooze(habit.id, todayStr);
          return;
        }

        notifiedRef.current.add(notifyKey);
        if (isSnoozeDue) clearHabitSnooze(habit.id, todayStr);

        // Play alarm sound
        playAlarmSound();

        const snoozeMinutes = habit.reminderSnoozeMinutes || 10;
        const reminderDescription =
          habit.habitKind === 'quit'
            ? `Stay strong: avoid ${habit.name} today.`
            : `Time for ${habit.emoji || '📋'} ${habit.name}.`;

        toast.info(habit.habitKind === 'quit' ? 'Bad-habit check-in' : 'Habit reminder', {
          description: reminderDescription,
          duration: 30_000,
          action: {
            label: `Snooze ${snoozeMinutes}m`,
            onClick: () => snoozeHabitReminder(habit.id, todayStr, snoozeMinutes),
          },
        });

        // Fire browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Habit Alarm ⏰', {
              body: `${reminderDescription} Open the app to snooze.`,
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
