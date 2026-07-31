'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mediaItemsService } from '@/lib/supabase/services';

export type MediaType = 'voice' | 'photo' | 'video';

export interface MediaEntry {
  id: string;
  type: MediaType;
  title: string;
  /** Base64 data URL or blob URL for storage */
  dataUrl: string;
  /** Optional thumbnail for video */
  thumbnailUrl?: string;
  /** File size in bytes */
  fileSize: number;
  /** Duration in seconds (for voice/video) */
  duration?: number;
  /** MIME type */
  mimeType: string;
  /** Creation timestamp */
  createdAt: string;
}

interface MediaStoreState {
  mediaEntries: MediaEntry[];
  isLoaded: boolean;
  fetchFromSupabase: () => Promise<void>;
  addMediaEntry: (entry: MediaEntry) => Promise<void>;
  deleteMediaEntry: (id: string) => Promise<void>;
  updateMediaEntry: (id: string, updates: Partial<MediaEntry>) => void;
}

export const useMediaStore = create<MediaStoreState>()(
  persist(
    (set) => ({
      mediaEntries: [],
      isLoaded: false,

      fetchFromSupabase: async () => {
        try {
          const entries = await mediaItemsService.fetchMediaEntries();
          if (entries && entries.length > 0) {
            set({ mediaEntries: entries, isLoaded: true });
          } else {
            set({ isLoaded: true });
          }
        } catch (err) {
          console.warn('Error fetching media items from Supabase:', err);
          set({ isLoaded: true });
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

      updateMediaEntry: (id, updates) =>
        set((state) => ({
          mediaEntries: state.mediaEntries.map((e) =>
            e.id === id ? { ...e, ...updates } : e,
          ),
        })),
    }),
    {
      name: 'media-store',
    },
  ),
);
