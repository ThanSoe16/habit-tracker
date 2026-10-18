'use client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { useSyncIdentity } from '@/components/providers/supabase-sync-provider';
import { requireIdentity } from '@/lib/supabase/require-identity';
import { mediaItemsService } from './supabase';
import type { ListPage } from '@/lib/supabase/pagination';
import type { MediaEntry } from '../types';

export function useMediaList(filter: 'all' | 'gallery' | 'voice' = 'all') {
  const userId = useQueryIdentity();
  const readyUserId = useSyncIdentity();
  const query = useInfiniteQuery({
    queryKey: ['media', userId, 'list', filter],
    enabled: Boolean(userId && readyUserId === userId),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => mediaItemsService.list(pageParam, filter, signal),
    getNextPageParam: (page) => page.nextPage,
  });
  return {
    ...query,
    mediaEntries: query.data?.pages.flatMap((page) => page.rows) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
  };
}

export function useMediaCounts() {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: ['media', userId, 'counts'],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => mediaItemsService.counts(signal),
  });
}

export function useMediaReport() {
  const userId = useQueryIdentity();
  const query = useQuery({
    queryKey: ['media', userId, 'report'],
    enabled: Boolean(userId),
    queryFn: async () => {
      const rows = await mediaItemsService.fetchMediaEntries();
      if (rows === null) throw new Error('Could not load your media report.');
      return rows;
    },
  });
  return {
    mediaEntries: query.data ?? [],
    lastSyncedAt: query.dataUpdatedAt ? new Date(query.dataUpdatedAt).toISOString() : null,
    syncError: query.isError ? 'Could not refresh media.' : null,
    fetchFromSupabase: query.refetch,
  };
}

export function useMediaActions() {
  const userId = useQueryIdentity();
  const client = useQueryClient();
  const key = ['media', userId];
  const refresh = () => client.invalidateQueries({ queryKey: key });
  const add = useMutation({
    mutationFn: async (entry: MediaEntry) => {
      await requireIdentity(userId!);
      return mediaItemsService.insertMediaEntry(entry);
    },
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      await requireIdentity(userId!);
      return mediaItemsService.deleteMediaEntry(id);
    },
    onSuccess: async (_, id) => {
      await client.cancelQueries({ queryKey: key });
      client.setQueriesData<InfiniteData<ListPage<MediaEntry>>>(
        { queryKey: [...key, 'list'] },
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              rows: page.rows.filter((row) => row.id !== id),
            })),
          },
      );
      await refresh();
    },
  });
  return { addMediaEntry: add.mutateAsync, deleteMediaEntry: remove.mutateAsync };
}
