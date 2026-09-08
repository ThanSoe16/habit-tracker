'use client';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { habitKeys } from './query-keys';
import { useQuery } from '@tanstack/react-query';
import habitsApiService from './api';
import { HabitFilterParams } from '../types';

export const useGetHabits = (params?: HabitFilterParams) => {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: habitKeys.list(userId, params),
    retry: false,
    queryFn: () => habitsApiService.getHabits(params),
    enabled: Boolean(userId),
  });
};

export const useGetHabitById = (id: string) => {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: habitKeys.detail(userId, id),
    retry: false,
    queryFn: () => habitsApiService.getHabitById(id),
    enabled: Boolean(userId && id.trim()),
  });
};
