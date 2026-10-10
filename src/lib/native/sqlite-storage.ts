import { isTauri } from '@tauri-apps/api/core';
import type { StateStorage } from 'zustand/middleware';
import { createQueuedStorage } from './queued-storage';
import { useNativeStatus } from './status';

let database: Promise<StateStorage> | undefined;

async function loadStorage(): Promise<StateStorage> {
  // Browser previews use browser storage; installed Tauri apps always use SQLite.
  if (!isTauri()) return localStorage;
  if (!database) {
    database = import('@tauri-apps/plugin-sql')
      .then(async ({ default: Database }) => {
        const db = await Database.load('sqlite:habit-tracker.db');
        return {
          async getItem(key: string) {
            const rows = await db.select<{ value: string }[]>(
              'SELECT value FROM local_state WHERE key = $1',
              [key],
            );
            return rows[0]?.value ?? null;
          },
          async setItem(key: string, value: string) {
            await db.execute(
              'INSERT INTO local_state (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
              [key, value],
            );
          },
          async removeItem(key: string) {
            await db.execute('DELETE FROM local_state WHERE key = $1', [key]);
          },
        };
      })
      .catch((error: unknown) => {
        database = undefined;
        throw error;
      });
  }
  return database;
}

export const nativeStorage = createQueuedStorage(loadStorage, (saving, storageError) => {
  useNativeStatus.setState({ saving, storageError });
});
