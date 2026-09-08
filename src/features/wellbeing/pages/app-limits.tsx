'use client';

import { useState } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AppLimitCard } from '../components/app-limit-card';
import { AppLimitDialog, type AppLimitDialogState } from '../components/app-limit-dialog';
import type { AppLimit } from '../types';
import { useWellbeingData } from '../hooks/use-wellbeing-data';
import { digitalWellbeingService } from '../services/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLimitsPage() {
  const { appLimits: limits, appUsage, isLoading, hasLoaded, error, refresh } = useWellbeingData();
  const [dialog, setDialog] = useState<AppLimitDialogState | null>(null);
  const availableApps = appUsage.filter(
    (app) => !limits.some((limit) => limit.appIdentifier === app.appIdentifier),
  );

  const toggleLimit = async (limit: AppLimit, enabled: boolean) => {
    try {
      await digitalWellbeingService.upsertAppLimit({
        app_identifier: limit.appIdentifier,
        app_name: limit.appName,
        daily_limit_seconds: limit.dailyLimitSeconds,
        warning_before_seconds: limit.warningBeforeSeconds,
        is_enabled: enabled,
      });
      await refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Could not update the limit.');
    }
  };

  const deleteLimit = async (limit: AppLimit) => {
    try {
      await digitalWellbeingService.deleteAppLimit(limit.id);
      await refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Could not delete the limit.');
    }
  };

  if (isLoading && !hasLoaded) return <Skeleton className="h-96 w-full" />;
  if (error && !hasLoaded)
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent>
      </Card>
    );

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          Could not refresh app limits. Please try again.
        </p>
      )}
      <Card
        size="sm"
        className="overflow-hidden rounded-[2rem] border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm shadow-primary/5"
      >
        <CardHeader className="flex flex-row items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck />
          </span>
          <div className="min-w-0">
            <CardTitle>App Limits</CardTitle>
            <CardDescription>
              Set healthy boundaries for distracting apps. OS-level blocking is not enabled.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setDialog({ mode: 'create' })}
          >
            <Plus data-icon="inline-start" /> Add another app
          </Button>
        </CardContent>
      </Card>

      {limits.map((limit) => (
        <AppLimitCard
          key={limit.id}
          limit={limit}
          onToggle={(enabled) => void toggleLimit(limit, enabled)}
          onEdit={() => setDialog({ mode: 'edit', limit })}
          onDelete={() => void deleteLimit(limit)}
        />
      ))}

      {!limits.length && (
        <Card className="rounded-2xl">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No app limits yet.
          </CardContent>
        </Card>
      )}

      {dialog && (
        <AppLimitDialog
          key={dialog.mode === 'edit' ? dialog.limit.id : 'create'}
          state={dialog}
          availableApps={availableApps}
          existingLimits={limits}
          onClose={() => setDialog(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
