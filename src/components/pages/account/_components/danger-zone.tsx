'use client';

import { useState } from 'react';
import { useHabitActions } from '@/features/habits/services/actions';
import { habitsService } from '@/features/habits/services/supabase';
import { useMoodActions } from '@/features/mood/services/queries';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/shared/dialog/confirmation-dialog';
import { Trash2 } from 'lucide-react';

export function DangerZone() {
  const { clearHistory } = useMoodActions();
  const { removeHabit } = useHabitActions();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function reset() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const habits = await habitsService.fetchHabits();
      if (!habits) throw new Error('Could not load habits to reset.');
      for (const habit of habits) await removeHabit(habit.id);
      await clearHistory();
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
