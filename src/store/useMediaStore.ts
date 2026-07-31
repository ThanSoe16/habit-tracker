'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MediaType = 'voice' | 'photo' | 'video';

export interface MediaEntry {
  id: string;
  type: MediaType;
  title: string;
  /** Base64 data URL or blob URL for local storage */
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
  addMediaEntry: (entry: MediaEntry) => void;
  deleteMediaEntry: (id: string) => void;
  updateMediaEntry: (id: string, updates: Partial<MediaEntry>) => void;
}

export const useMediaStore = create<MediaStoreState>()(
  persist(
    (set) => ({
      mediaEntries: [],

      addMediaEntry: (entry) =>
        set((state) => ({
          mediaEntries: [entry, ...state.mediaEntries],
        })),

      deleteMediaEntry: (id) =>
        set((state) => ({
          mediaEntries: state.mediaEntries.filter((e) => e.id !== id),
        })),

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
