'use client';

import { useState } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AppLimitCard } from '../components/app-limit-card';
import type { AppLimit } from '../types';
import { useWellbeingData } from '../hooks/use-wellbeing-data';
import { digitalWellbeingService } from '../services/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDuration } from '../utils/format-duration';

export default function AppLimitsPage() {
  const { appLimits: limits, appUsage, isLoading, error, refresh } = useWellbeingData();
  const [editing, setEditing] = useState<AppLimit | null>(null);
  const [limitSeconds, setLimitSeconds] = useState(3600);
  const [warningSeconds, setWarningSeconds] = useState(300);

  const openEditor = (limit: AppLimit) => {
    setEditing(limit);
    setLimitSeconds(limit.dailyLimitSeconds);
    setWarningSeconds(limit.warningBeforeSeconds);
  };

  const saveLimit = async () => {
    if (!editing) return;
    try {
      await digitalWellbeingService.upsertAppLimit({ app_identifier: editing.appIdentifier, app_name: editing.appName, daily_limit_seconds: limitSeconds, warning_before_seconds: warningSeconds, is_enabled: editing.enabled });
      setEditing(null);
      await refresh();
      toast.success(`${editing.appName} limit updated.`);
    } catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Could not save the limit.'); }
  };

  const addNextApp = () => {
    const app = appUsage.find(
      (candidate) => !limits.some((limit) => limit.appIdentifier === candidate.appIdentifier),
    );
    if (!app) return;
    const newLimit: AppLimit = {
      id: `limit-${app.id}`,
      appIdentifier: app.appIdentifier,
      appName: app.appName,
      icon: app.icon,
      dailyLimitSeconds: 3600,
      usedTodaySeconds: app.durationSeconds,
      warningBeforeSeconds: 300,
      enabled: true,
    };
    openEditor(newLimit);
  };

  const toggleLimit = async (limit: AppLimit, enabled: boolean) => {
    try {
      await digitalWellbeingService.upsertAppLimit({ app_identifier: limit.appIdentifier, app_name: limit.appName, daily_limit_seconds: limit.dailyLimitSeconds, warning_before_seconds: limit.warningBeforeSeconds, is_enabled: enabled });
      await refresh();
    } catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Could not update the limit.'); }
  };

  const deleteLimit = async (limit: AppLimit) => {
    try { await digitalWellbeingService.deleteAppLimit(limit.id); await refresh(); }
    catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Could not delete the limit.'); }
  };

  if (isLoading) return <div className="min-h-[60vh]" />;
  if (error) return <Card><CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent></Card>;

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden rounded-[2rem] shadow-sm">
        <CardHeader className="flex-row items-center gap-4 bg-gradient-to-br from-primary to-primary/75 text-primary-foreground">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur-sm"><ShieldCheck /></span>
          <div><CardTitle className="text-primary-foreground">App Limits</CardTitle>
          <CardDescription className="text-primary-foreground/70">Set healthy boundaries for distracting apps. OS-level blocking is not enabled.</CardDescription></div>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            disabled={limits.length >= appUsage.length}
            onClick={addNextApp}
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
          onEdit={() => openEditor(limit)}
          onDelete={() => void deleteLimit(limit)}
        />
      ))}

      {!limits.length && (
        <Card className="rounded-2xl"><CardContent className="py-10 text-center text-sm text-muted-foreground">No app limits yet.</CardContent></Card>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editing?.appName} limit</DialogTitle>
            <DialogDescription>Choose a daily duration and warning time.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Daily limit: {formatDuration(limitSeconds)}</FieldLabel>
              <Slider value={[limitSeconds]} min={900} max={14400} step={900} onValueChange={(value) => setLimitSeconds(value[0] ?? 900)} />
            </Field>
            <Field>
              <FieldLabel>Warn me before</FieldLabel>
              <Select value={String(warningSeconds)} onValueChange={(value) => setWarningSeconds(Number(value))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup><SelectLabel>Warning</SelectLabel><SelectItem value="300">5 minutes</SelectItem><SelectItem value="600">10 minutes</SelectItem><SelectItem value="900">15 minutes</SelectItem></SelectGroup></SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter><Button onClick={saveLimit}>Save limit</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
