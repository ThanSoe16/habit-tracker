'use client';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldDescription } from '@/components/ui/field';
import { AppSettingsLink, SettingsSection } from '@/components/settings/settings-controls';
import { useMediaStore } from '@/store/use-media-store';

export default function StoreGeneralsSettingsPage() {
  const { mediaEntries, lastSyncedAt, syncError, fetchFromSupabase } = useMediaStore();
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try {
      await fetchFromSupabase();
    } finally {
      setRefreshing(false);
    }
  };
  const size = mediaEntries.reduce((total, entry) => total + entry.fileSize, 0);
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 pb-8">
      <SettingsSection
        title="Media library"
        description="Photos, videos, and voice recordings in your library."
      >
        <p className="text-sm">
          {mediaEntries.length} items · {(size / 1024 / 1024).toFixed(1)} MB of recorded file sizes
        </p>
        <div role="status" className="text-sm text-muted-foreground">
          {syncError ||
            (lastSyncedAt
              ? `Last refreshed ${new Date(lastSyncedAt).toLocaleString()}`
              : 'Your library has not been refreshed in this session.')}
        </div>
        <Button variant="outline" disabled={refreshing} onClick={() => void refresh()}>
          <RefreshCw data-icon="inline-start" />
          {refreshing ? 'Refreshing…' : syncError ? 'Retry refresh' : 'Refresh library'}
        </Button>
      </SettingsSection>
      <SettingsSection
        title="Capture & permissions"
        description="Recording capabilities depend on your browser and device."
      >
        <FieldDescription>
          Camera and microphone access is requested when you start capturing. Manage blocked
          permissions in your browser’s site settings.
        </FieldDescription>
        <FieldDescription>
          Recording format and resolution are chosen by the capture flow and available hardware.
          There are no adjustable capture-quality preferences yet.
        </FieldDescription>
      </SettingsSection>
      <AppSettingsLink />
    </div>
  );
}
