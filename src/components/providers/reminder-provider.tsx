'use client';

import { useReminders } from '@/hooks/use-reminders';

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  useReminders();
  return <>{children}</>;
}
