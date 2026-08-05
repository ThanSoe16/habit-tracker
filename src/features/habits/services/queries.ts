import { useQuery } from '@tanstack/react-query';
import habitsApiService from './api';
import { HabitFilterParams } from '../types';

export const useGetHabits = (params?: HabitFilterParams) => {
  return useQuery({
    queryKey: ['habits', params],
    queryFn: () => habitsApiService.getHabits(params),
  });
};

export const useGetHabitById = (id: string) => {
  return useQuery({
    queryKey: ['habit', id],
    queryFn: () => habitsApiService.getHabitById(id),
    enabled: !!id,
  });
};
