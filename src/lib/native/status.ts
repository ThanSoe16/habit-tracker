'use client';

import { create } from 'zustand';

type NativeStatus = {
  userId: string | null;
  loading: boolean;
  hydrationError: boolean;
  saving: boolean;
  storageError: boolean;
  syncing: boolean;
  syncError: string | null;
};

export const useNativeStatus = create<NativeStatus>(() => ({
  userId: null,
  loading: true,
  hydrationError: false,
  saving: false,
  storageError: false,
  syncing: false,
  syncError: null,
}));
