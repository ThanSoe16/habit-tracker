'use client';

import { useState } from 'react';
import { useHabitStore } from '@/store/use-habit-store';
import { useMoodStore } from '@/store/use-mood-store';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/shared/dialog/confirmation-dialog';
import { Trash2 } from 'lucide-react';

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function reset() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      for (const habit of useHabitStore.getState().habits) {
        await useHabitStore.getState().removeHabit(habit.id);
      }
      await useMoodStore.getState().clearHistory();
      setOpen(false);
    } catch {
      setError(
        'Could not finish deleting your data. Completed deletions are saved; retry to clear the remaining data.',
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Button
        variant="destructive"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <Trash2 aria-hidden="true" /> Reset All Data
      </Button>
      <ConfirmationDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Reset habits and moods?"
        desc="This will delete your habits, completions, and mood history."
        confirmText="Delete Everything"
        isLoading={pending}
        error={error}
        onPress={() => {
          void reset();
        }}
      />
    </>
  );
}
