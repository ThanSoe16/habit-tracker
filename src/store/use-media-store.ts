'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mediaItemsService } from '@/features/media/services/supabase';
import { z } from 'zod';

export const mediaTypeSchema = z.enum(['voice', 'photo', 'video']);
export type MediaType = z.infer<typeof mediaTypeSchema>;

export const mediaEntrySchema = z.object({
  id: z.string(),
  type: mediaTypeSchema,
  title: z.string(),
  dataUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  fileSize: z.number().nonnegative(),
  duration: z.number().nonnegative().optional(),
  mimeType: z.string(),
  createdAt: z.string(),
});

export type MediaEntry = z.infer<typeof mediaEntrySchema>;

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
        set((state) => ({
          mediaEntries: [entry, ...state.mediaEntries],
        }));
        await mediaItemsService.insertMediaEntry(entry);
      },

      deleteMediaEntry: async (id) => {
        set((state) => ({
          mediaEntries: state.mediaEntries.filter((e) => e.id !== id),
        }));
        await mediaItemsService.deleteMediaEntry(id);
      },

      updateMediaEntry: async (id, updates) => {
        set((state) => ({
          mediaEntries: state.mediaEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
        await mediaItemsService.updateMediaEntry(id, updates);
      },
    }),
    {
      name: 'media-store',
      partialize: (state) => ({ mediaEntries: state.mediaEntries }),
    },
  ),
);
