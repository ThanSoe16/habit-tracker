'use client';

import { useState, useSyncExternalStore } from 'react';
import { format } from 'date-fns';
import { Brain, Clock3, Play, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from '@/components/ui/field';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FocusTimer } from '../components/focus-timer';
import { useWellbeingData } from '../hooks/use-wellbeing-data';
import { useFocusSessionStore } from '../store/use-focus-session-store';
import { formatDuration } from '../utils/format-duration';
import { AppIcon } from '../components/app-icon';

const durations = [15, 25, 30, 45, 60];

export default function FocusModePage() {
  const { activeSession, start } = useFocusSessionStore();
  const { appUsage, focusHistory, isLoading, error } = useWellbeingData();
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const [duration, setDuration] = useState(25);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  const toggleApp = (app: string, checked: boolean) => {
    setSelectedApps((current) => checked ? [...new Set([...current, app])] : current.filter((item) => item !== app));
  };

  if (!hydrated || isLoading) return <div className="min-h-[60vh]" />;
  if (error) return <Card><CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent></Card>;

  if (activeSession) {
    return <Card className="rounded-[2rem] shadow-sm"><CardHeader><CardTitle>Focus Session</CardTitle><CardDescription>Stay with the task in front of you.</CardDescription></CardHeader><CardContent><FocusTimer /></CardContent></Card>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card size="sm" className="overflow-hidden rounded-[2rem] border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm shadow-primary/5">
        <CardHeader className="flex flex-row items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Brain /></span>
          <div className="min-w-0"><CardTitle>Start Focus Session</CardTitle><CardDescription>Select a duration and the apps you want to avoid.</CardDescription></div>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>Duration</FieldLabel>
              <ToggleGroup type="single" value={String(duration)} onValueChange={(value) => value && setDuration(Number(value))} variant="outline" className="grid grid-cols-5">
                {durations.map((minutes) => <ToggleGroupItem key={minutes} value={String(minutes)} className="w-full data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{minutes}</ToggleGroupItem>)}
              </ToggleGroup>
              <div className="flex items-center gap-3 pt-2"><Timer className="text-primary" /><Slider value={[duration]} min={5} max={120} step={5} onValueChange={(value) => setDuration(value[0] ?? 25)} /><Badge variant="secondary">{duration}m</Badge></div>
            </Field>
            <FieldSet className="gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <FieldLegend variant="label">Distracting apps</FieldLegend>
                  <FieldDescription>Choose the apps you want to pause during focus.</FieldDescription>
                </div>
                <Badge variant={selectedApps.length ? 'default' : 'secondary'}>
                  {selectedApps.length} selected
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                {appUsage.slice(0, 5).map((app) => (
                  <Field key={app.id}>
                    <FieldLabel
                      htmlFor={`focus-${app.id}`}
                      className="w-full cursor-pointer items-center rounded-2xl border bg-card p-3 shadow-xs transition-all hover:border-primary/30 hover:bg-primary/5 has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:shadow-sm"
                    >
                      <AppIcon app={app} className="size-10" />
                      <FieldContent>
                        <FieldTitle>{app.appName}</FieldTitle>
                        <FieldDescription>{app.category}</FieldDescription>
                      </FieldContent>
                      <Checkbox
                        id={`focus-${app.id}`}
                        className="ml-auto"
                        checked={selectedApps.includes(app.appName)}
                        onCheckedChange={(checked) => toggleApp(app.appName, checked === true)}
                      />
                    </FieldLabel>
                  </Field>
                ))}
              </div>
            </FieldSet>
            <Button size="lg" className="w-full" disabled={!selectedApps.length || !appUsage.length} onClick={() => start(duration * 60, selectedApps)}>
              <Play data-icon="inline-start" />
              {selectedApps.length ? `Start ${duration}m focus` : 'Select an app to start'}
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card size="sm" className="rounded-[2rem] shadow-sm">
        <CardHeader><CardTitle>Focus History</CardTitle><CardDescription>Your recent protected sessions</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {focusHistory.map((session) => (
            <div key={session.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/40 p-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Clock3 /></span>
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{format(new Date(session.startedAt), 'MMM d, h:mm a')}</p><p className="truncate text-xs text-muted-foreground">{session.apps.join(', ') || 'No blocked apps'}</p></div>
              <div className="text-right"><p className="text-sm font-bold">{formatDuration(session.durationSeconds)}</p><Badge variant={session.status === 'COMPLETED' ? 'secondary' : 'outline'}>{session.status}</Badge></div>
            </div>
          ))}
          {!focusHistory.length && <p className="py-8 text-center text-sm text-muted-foreground">No focus sessions recorded yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
