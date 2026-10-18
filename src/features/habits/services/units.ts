'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { requireIdentity } from '@/lib/supabase/require-identity';
import { habitsService } from './supabase';
import { toast } from 'sonner';

export function useHabitUnits() {
  const userId = useQueryIdentity();
  const client = useQueryClient();
  const key = ['habits', userId, 'units'];
  const query = useQuery({
    queryKey: key,
    enabled: Boolean(userId),
    queryFn: habitsService.fetchCustomUnits,
  });
  const mutation = useMutation({
    scope: { id: `habit-writes:${userId}` },
    mutationFn: async ({ oldName, name }: { oldName?: string; name?: string }) => {
      await requireIdentity(userId!);
      if (name && !(await habitsService.addCustomUnit(name)))
        throw new Error('Could not save unit.');
      if (oldName && name) {
        const habits = await habitsService.fetchHabits();
        if (!habits) throw new Error('Could not update habits.');
        for (const habit of habits.filter((item) => item.unit === oldName))
          await habitsService.saveHabit({ ...habit, unit: name });
      }
      if (oldName && !(await habitsService.deleteCustomUnit(oldName)))
        throw new Error('Could not remove unit.');
    },
    onSettled: () => client.invalidateQueries({ queryKey: ['habits', userId] }),
    onError: () => toast.error('Could not save your units. Please retry.'),
  });
  return {
    customUnits: query.data ?? [],
    addCustomUnit: (name: string) => mutation.mutate({ name: name.trim() }),
    updateCustomUnit: (oldName: string, name: string) =>
      mutation.mutate({ oldName, name: name.trim() }),
    deleteCustomUnit: (oldName: string) => mutation.mutate({ oldName }),
  };
}
