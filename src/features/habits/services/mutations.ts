'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requireIdentity } from '@/lib/supabase/require-identity';
import habitsApiService from './api';
import { habitKeys } from './query-keys';
import type { Habit } from '../types';

export const useSaveHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, habit }: { userId: string; habit: Habit }) => {
      await requireIdentity(userId);
      return habitsApiService.saveHabit(habit);
    },
    retry: false,
    onSuccess: async (saved, { userId }) => {
      queryClient.setQueryData(habitKeys.detail(userId, saved.id), saved);
      await queryClient.invalidateQueries({ queryKey: habitKeys.lists(userId) });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, id }: { userId: string; id: string }) => {
      await requireIdentity(userId);
      return habitsApiService.deleteHabit(id);
    },
    retry: false,
    onSuccess: async (_, { userId, id }) => {
      queryClient.setQueryData(habitKeys.detail(userId, id), null);
      await queryClient.invalidateQueries({ queryKey: habitKeys.lists(userId) });
    },
  });
};
