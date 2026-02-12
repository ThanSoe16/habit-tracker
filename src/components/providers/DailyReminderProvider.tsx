'use client';

import { useDailyReminder } from '@/hooks/useDailyReminder';

export function DailyReminderProvider({ children }: { children: React.ReactNode }) {
  useDailyReminder();
  return <>{children}</>;
}
