'use client';

import { useDailyReminder } from '@/hooks/use-daily-reminder';

export function DailyReminderProvider({ children }: { children: React.ReactNode }) {
  useDailyReminder();
  return <>{children}</>;
}
