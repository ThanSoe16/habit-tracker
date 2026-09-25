'use client';
import { create } from 'zustand';
export type SettingsScope = 'profile' | 'workout' | 'budget' | 'goals';
export type SyncState = {
  status: 'idle' | 'saving' | 'saved' | 'error';
  error?: string;
  retry?: () => void;
};
const idle: SyncState = { status: 'idle' };
export const useSettingsSync = create<Record<SettingsScope, SyncState>>(() => ({
  profile: idle,
  workout: idle,
  budget: idle,
  goals: idle,
}));
export function reportSettingsSync(
  scope: SettingsScope,
  status: SyncState['status'],
  retry: () => void,
  error?: string,
) {
  useSettingsSync.setState({ [scope]: { status, error, retry } });
}
