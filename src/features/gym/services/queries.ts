'use client';
import { gymBodyMetricsService, type BodyMetricRow } from './body-metrics';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { requireIdentity } from '@/lib/supabase/require-identity';
import { assertIdentityRevision, identityRevision } from '@/lib/supabase/identity-scope';
import { useGymStore } from '@/store/use-gym-store';
import { applyRemoteGymState } from '../store/gym-sync';
import { gymService } from './supabase';

export function useWorkoutLog(date: string) {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: ['gym', userId, 'workout', date],
    enabled: Boolean(userId),
    queryFn: async ({ signal }) => {
      const revision = identityRevision();
      const previous = useGymStore.getState().history[date];
      const log = await gymService.workout(date, signal);
      assertIdentityRevision(revision);
      if (useGymStore.getState().history[date] === previous)
        applyRemoteGymState(() =>
          useGymStore.setState((state) => {
            const history = { ...state.history };
            if (log) history[date] = log;
            else delete history[date];
            return { history };
          }),
        );
      return true;
    },
  });
}
export function useWorkoutHistory() {
  const userId = useQueryIdentity();
  return useInfiniteQuery({
    queryKey: ['gym', userId, 'history'],
    enabled: Boolean(userId),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => gymService.workoutPage(pageParam, signal),
    getNextPageParam: (page) => page.nextPage,
  });
}
export function useWorkoutSummary() {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: ['gym', userId, 'summary'],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => gymService.workoutSummary(signal),
  });
}
export function useDeleteWorkout() {
  const userId = useQueryIdentity();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      await requireIdentity(userId!);
      await gymService.deleteWorkoutLog(date);
    },
    onSuccess: async (_, date) => {
      applyRemoteGymState(() =>
        useGymStore.setState((state) => {
          const history = { ...state.history };
          delete history[date];
          return { history };
        }),
      );
      await client.invalidateQueries({ queryKey: ['gym', userId] });
      await client.invalidateQueries({ queryKey: ['legacy-sync', userId, 'gym'] });
    },
  });
}

export function useMetricHistory(month: string) {
  const userId = useQueryIdentity();
  return useInfiniteQuery({
    queryKey: ['gym', userId, 'metrics', month],
    enabled: Boolean(userId),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => gymBodyMetricsService.list(pageParam, month, signal),
    getNextPageParam: (page) => page.nextPage,
  });
}
export function useMetricSummary(month: string) {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: ['gym', userId, 'metric-summary', month],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => gymBodyMetricsService.fetchLogs(month, true, signal),
  });
}
export function useMetricActions() {
  const userId = useQueryIdentity();
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ['gym', userId] });
  const add = useMutation({
    mutationFn: async (row: BodyMetricRow) => {
      await requireIdentity(userId!);
      await useGymStore.getState().addBodyMetricLog(row);
    },
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      await requireIdentity(userId!);
      await useGymStore.getState().deleteBodyMetricLog(id);
    },
    onSuccess: refresh,
  });
  return { addBodyMetricLog: add.mutateAsync, deleteBodyMetricLog: remove.mutateAsync };
}
