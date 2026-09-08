'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mediaItemsService } from '@/features/media/services/supabase';

export * from '@/features/media/types';
import type { MediaEntry } from '@/features/media/types';

interface MediaStoreState {
  mediaEntries: MediaEntry[];
  isLoaded: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
  fetchFromSupabase: () => Promise<void>;
  addMediaEntry: (entry: MediaEntry) => Promise<void>;
  deleteMediaEntry: (id: string) => Promise<void>;
  updateMediaEntry: (id: string, updates: Partial<MediaEntry>) => Promise<void>;
}

export const useMediaStore = create<MediaStoreState>()(
  persist(
    (set) => ({
      mediaEntries: [],
      isLoaded: false,
      lastSyncedAt: null,
      syncError: null,

      fetchFromSupabase: async () => {
        try {
          const entries = await mediaItemsService.fetchMediaEntries();
          if (entries === null) throw new Error('Could not refresh your media library.');
          set({
            mediaEntries: entries,
            isLoaded: true,
            lastSyncedAt: new Date().toISOString(),
            syncError: null,
          });
        } catch (err) {
          console.warn('Error fetching media items from Supabase:', err);
          set({
            isLoaded: true,
            syncError: err instanceof Error ? err.message : 'Could not refresh media.',
          });
        }
      },

      addMediaEntry: async (entry) => {
        const saved = await mediaItemsService.insertMediaEntry(entry);
        set((state) => ({
          mediaEntries: [saved, ...state.mediaEntries.filter((item) => item.id !== saved.id)],
        }));
      },

      deleteMediaEntry: async (id) => {
        await mediaItemsService.deleteMediaEntry(id);
        set((state) => ({
          mediaEntries: state.mediaEntries.filter((e) => e.id !== id),
        }));
      },

      updateMediaEntry: async (id, updates) => {
        const saved = await mediaItemsService.updateMediaEntry(id, updates);
        set((state) => ({
          mediaEntries: state.mediaEntries.map((e) => (e.id === id ? saved : e)),
        }));
      },
    }),
    {
      name: 'media-store',
      partialize: (state) => ({ mediaEntries: state.mediaEntries }),
    },
  ),
);
