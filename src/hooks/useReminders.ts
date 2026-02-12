'use client';

import { useEffect, useRef } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { useUserStore } from '@/store/useUserStore';
import { isHabitRequiredOnDate, getLocalDateString } from '@/utils/dateUtils';

/**
 * Hook that checks every minute if any habit has a reminder due.
 * Fires a browser notification if:
 *  - Reminders are globally enabled
 *  - The habit has a reminderTime set
 *  - The habit is required today
 *  - The habit is not yet completed today
 *  - We haven't already notified for this habit today
 */
export function useReminders() {
  const { habits } = useHabitStore();
  const { remindersEnabled } = useUserStore();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!remindersEnabled) return;
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = getLocalDateString(now);

      habits.forEach((habit) => {
        if (!habit.reminderTime) return;
        if (habit.reminderTime !== currentTime) return;

        // Check if already notified today
        const notifyKey = `${habit.id}_${todayStr}`;
        if (notifiedRef.current.has(notifyKey)) return;

        // Check if habit is required today
        if (!isHabitRequiredOnDate(habit, now)) return;

        // Check if already completed today
        const entry = habit.history[todayStr];
        const isDone = typeof entry === 'boolean' ? entry : entry?.completed;
        if (isDone) return;

        // Fire notification
        if (Notification.permission === 'granted') {
          new Notification('Habit Reminder ⏰', {
            body: `Time for: ${habit.emoji || '📋'} ${habit.name}`,
            icon: '/favicon.ico',
            tag: notifyKey,
          });
          notifiedRef.current.add(notifyKey);
        }
      });
    };

    // Check immediately on mount
    checkReminders();

    // Then check every 30 seconds (to avoid missing the exact minute)
    const interval = setInterval(checkReminders, 30_000);

    return () => clearInterval(interval);
  }, [habits, remindersEnabled]);
}
