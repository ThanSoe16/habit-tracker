'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { identityRevision, assertIdentityRevision } from '@/lib/supabase/identity-scope';
import { requireIdentity } from '@/lib/supabase/require-identity';
import type { HabitStore } from '@/store/use-habit-store';
import type { Habit } from '../types';
import { habitsService } from './supabase';
import { habitKeys } from './query-keys';
import { replaceCachedHabit } from './habit-cache';
import { calculateStreak } from '../utils/streak';
import { createHabitCompletion } from '../utils/completion';
import { toast } from 'sonner';

type Write =
  | { id: string; update: (habit: Habit) => Habit }
  | { create: Habit }
  | { remove: string };

export function useHabitActions() {
  const userId = useQueryIdentity()!;
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['habits', userId, 'write'],
    scope: { id: `habit-writes:${userId}` },
    mutationFn: async (input: Write) => {
      const revision = identityRevision();
      await requireIdentity(userId);
      await client.cancelQueries({ queryKey: habitKeys.scope(userId) });
      assertIdentityRevision(revision);
      if ('remove' in input) {
        if (!(await habitsService.deleteHabit(input.remove)))
          throw new Error('Could not delete the habit.');
        replaceCachedHabit(client, userId, null, input.remove);
        return null;
      }
      const before = 'id' in input ? await habitsService.detail(input.id) : null;
      if ('id' in input && !before) throw new Error('This habit is unavailable. Please refresh.');
      const next =
        'create' in input
          ? { ...input.create, sortOrder: await habitsService.nextSortOrder() }
          : input.update(before!);
      assertIdentityRevision(revision);
      replaceCachedHabit(client, userId, next, next.id);
      try {
        const saved = await habitsService.saveHabit(next);
        client.setQueryData(habitKeys.detail(userId, saved.id), saved);
        replaceCachedHabit(client, userId, saved, saved.id);
        return saved;
      } catch (error) {
        replaceCachedHabit(client, userId, before, next.id);
        throw error;
      }
    },
    onSettled: () => client.invalidateQueries({ queryKey: habitKeys.scope(userId) }),
  });
  const updateHabit: HabitStore['updateHabit'] = async (id, updates) =>
    (await mutation.mutateAsync({ id, update: (habit) => ({ ...habit, ...updates }) }))!;
  const addHabit: HabitStore['addHabit'] = async (
    name,
    color,
    frequency,
    repeatDays,
    emoji,
    startDate,
    endDate,
    type = 'habit',
    timeOfDay,
    reminderTime,
    endHabitDate,
    endHabitDays,
    specificDates,
    unitType = 'simple',
    goalValue,
    unit,
    timerMode,
    timeUnit,
    habitKind = 'build',
    reminderSnoozeMinutes = 10,
  ) => {
    return (await mutation.mutateAsync({
      create: {
        id: crypto.randomUUID(),
        name,
        color,
        frequency,
        repeatDays,
        emoji,
        startDate,
        endDate,
        type,
        timeOfDay,
        reminderTime,
        endHabitDate,
        endHabitDays,
        specificDates,
        unitType,
        goalValue,
        unit,
        timerMode,
        timeUnit,
        habitKind,
        reminderSnoozeMinutes,
        createdAt: new Date().toISOString(),
        history: {},
        streak: 0,
      },
    }))!;
  };
  const historyChange = (id: string, change: (habit: Habit) => Habit['history']) =>
    mutation.mutateAsync({
      id,
      update: (habit) => {
        const history = change(habit);
        return { ...habit, history, streak: calculateStreak(habit, history) };
      },
    });
  const background = (promise: Promise<unknown>) => {
    void promise.catch(() => toast.error('Could not save the habit. Please try again.'));
  };
  const toggleHabit: HabitStore['toggleHabit'] = (id, date, details) =>
    background(
      historyChange(id, (habit) => {
        const history = { ...habit.history };
        const previous = history[date];
        if (details)
          history[date] = {
            completed: false,
            ...(typeof previous === 'object' ? previous : {}),
            ...Object.fromEntries(
              Object.entries(details).filter(([, value]) => value !== undefined),
            ),
          };
        else if (previous) delete history[date];
        else history[date] = { completed: true };
        return history;
      }),
    );
  return {
    addHabit,
    updateHabit,
    toggleHabit,
    removeHabit: async (id: string) => {
      await mutation.mutateAsync({ remove: id });
    },
    completeHabit: async (id: string, date: string, notes: string) => {
      await historyChange(id, (habit) => ({
        ...habit.history,
        [date]: createHabitCompletion(habit, date, notes),
      }));
    },
    removeCompletion: (id: string, date: string) =>
      background(
        historyChange(id, (habit) => {
          const history = { ...habit.history };
          delete history[date];
          return history;
        }),
      ),
    reorderHabits: (habits: Habit[]) => {
      const positions = habits.map((habit) => habit.sortOrder ?? 0).sort((a, b) => a - b);
      background(
        (async () => {
          for (const [index, habit] of habits.entries())
            await mutation.mutateAsync({
              id: habit.id,
              update: (current) => ({ ...current, sortOrder: positions[index] }),
            });
        })(),
      );
    },
  };
}
