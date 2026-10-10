'use client';

import { useEffect, useState } from 'react';
import { format, startOfDay, addDays } from 'date-fns';
import { Smile } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { FloatingActionButton } from '@/components/shared/floating-action-button';
import { MoodEntryDrawer } from '@/components/pages/(mood)/_components/mood-entry-drawer';
import { useMoodStore } from '@/store/use-mood-store';

export function HomeMoodCheckIn() {
  const [today, setToday] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [entryDate, setEntryDate] = useState<Date | null>(null);
  const { hasMood, isLoaded, isLoading, error, fetchFromSupabase } = useMoodStore(
    useShallow((state) => ({
      hasMood: Boolean(state.history[today]),
      isLoaded: state.isLoaded,
      isLoading: state.isLoading,
      error: state.error,
      fetchFromSupabase: state.fetchFromSupabase,
    })),
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const refreshDate = () => {
      setToday(format(new Date(), 'yyyy-MM-dd'));
      scheduleMidnight();
    };
    function scheduleMidnight() {
      clearTimeout(timeout);
      const now = new Date();
      timeout = setTimeout(refreshDate, startOfDay(addDays(now, 1)).getTime() - now.getTime());
    }
    scheduleMidnight();
    window.addEventListener('focus', refreshDate);
    document.addEventListener('visibilitychange', refreshDate);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('focus', refreshDate);
      document.removeEventListener('visibilitychange', refreshDate);
    };
  }, []);

  return (
    <>
      {!hasMood && (isLoaded || error) && (
        <FloatingActionButton
          aria-label={isLoaded ? 'Set today’s mood' : 'Retry loading today’s mood'}
          aria-haspopup={isLoaded ? 'dialog' : undefined}
          disabled={!isLoaded && isLoading}
          onClick={() => {
            if (!isLoaded) {
              void fetchFromSupabase();
              return;
            }
            // Home's habit calendar selection must not change the check-in date.
            setEntryDate(new Date());
          }}
        >
          <Smile data-icon="inline-start" />
          {isLoaded ? 'Mood' : isLoading ? 'Loading…' : 'Retry mood'}
        </FloatingActionButton>
      )}
      {isLoaded && entryDate && (
        <MoodEntryDrawer isOpen selectedDate={entryDate} onClose={() => setEntryDate(null)} />
      )}
    </>
  );
}
