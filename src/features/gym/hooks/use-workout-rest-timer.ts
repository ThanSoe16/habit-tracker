'use client';

import { useEffect, useState } from 'react';
import { createTimerSound } from '@/features/habits/utils/timer-sound';
import { useGymStore } from '@/store/use-gym-store';

export function useWorkoutRestTimer(dateStr: string, seconds: number) {
  const [session, setSession] = useState<{
    exercise?: { id: string; name: string };
    sound: ReturnType<typeof createTimerSound>;
    seconds: number;
  } | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => () => session?.sound.dispose(), [session]);

  function open(exercise?: { id: string; name: string }) {
    if (!session) {
      const sound = createTimerSound();
      sound.prepare();
      setSession({ exercise, sound, seconds: seconds || 60 });
    }
    setExpanded(true);
  }

  function complete() {
    if (session?.exercise) {
      useGymStore.getState().updateCompletedSet(dateStr, session.exercise.id, 1);
    }
  }

  function close() {
    session?.sound.dispose();
    setSession(null);
    setExpanded(false);
  }

  return { session, expanded, setExpanded, open, close, complete };
}
