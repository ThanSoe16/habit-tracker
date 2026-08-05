import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import habitsApiService from './api';
import { Habit } from '../types';

export const useSaveHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (habit: Habit) => habitsApiService.saveHabit(habit),
    onSettled: async (response, error) => {
      if (error) {
        toast.error((error as Error)?.message || 'Failed to save habit');
      } else {
        toast.success('Habit saved successfully');
        await queryClient.invalidateQueries({ queryKey: ['habits'] });
        if (response?.id) {
          await queryClient.invalidateQueries({ queryKey: ['habit', response.id] });
        }
      }
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => habitsApiService.deleteHabit(id),
    onSettled: async (response, error) => {
      if (error) {
        toast.error((error as Error)?.message || 'Failed to delete habit');
      } else {
        toast.success('Habit deleted successfully');
        await queryClient.invalidateQueries({ queryKey: ['habits'] });
      }
    },
  });
};
