'use client';

import { useEffect, useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { CloudUpload, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNativeStatus } from '@/lib/native/status';
import { nativeStorage } from '@/lib/native/sqlite-storage';
import { useGoalsStore } from '@/features/goals/store/use-goals-store';
import { countPendingGoals, emptyGoalsSnapshot } from '@/features/goals/services/manual-sync';
import { runNativeGoalsSync } from '@/features/goals/services/native-sync';

export function NativeSyncControl() {
  const syncing = useNativeStatus((state) => state.syncing);
  const saving = useNativeStatus((state) => state.saving);
  const storageError = useNativeStatus((state) => state.storageError);
  const error = useNativeStatus((state) => state.syncError);
  const goals = useGoalsStore((state) => state.goals);
  const settings = useGoalsStore((state) => state.settings);
  const baseline = useGoalsStore((state) => state.cloudSnapshot);
  const lastSyncedAt = useGoalsStore((state) => state.lastSyncedAt);
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  const pending = countPendingGoals({ goals, settings }, baseline ?? emptyGoalsSnapshot);
  const label = storageError
    ? 'Device save failed'
    : saving
      ? 'Saving on device...'
      : pending
        ? `${pending} pending changes`
        : lastSyncedAt
          ? 'Synced'
          : 'Saved on device';

  return (
    <Flex direction="column" gap="2" className="border-b border-border py-2">
      <Flex justify="between" align="center" gap="3">
        <span role="status" className="min-w-0 text-xs text-muted-foreground">
          {online ? label : `Offline - ${label}`}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!online || syncing || saving || storageError}
          onClick={() => void runNativeGoalsSync()}
        >
          {syncing ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <CloudUpload data-icon="inline-start" />
          )}
          {syncing ? 'Syncing...' : 'Sync'}
        </Button>
      </Flex>
      {lastSyncedAt && (
        <p className="text-xs text-muted-foreground">
          Last sync: {new Date(lastSyncedAt).toLocaleString()}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {storageError && (
        <Flex align="center" gap="2">
          <p role="alert" className="text-xs text-destructive">
            Changes are not saved on this device yet.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void nativeStorage.retry().catch(() => undefined)}
          >
            Retry save
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
