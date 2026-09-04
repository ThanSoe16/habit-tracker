'use client';

import { useState, useSyncExternalStore } from 'react';
import { format } from 'date-fns';
import { Brain, Clock3, Play, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field';
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
    <div className="flex flex-col gap-5">
      <Card className="overflow-hidden rounded-[2rem] shadow-sm">
        <CardHeader className="flex-row items-center gap-4 bg-gradient-to-br from-primary to-primary/75 text-primary-foreground">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur-sm"><Brain /></span>
          <div><CardTitle className="text-primary-foreground">Start Focus Session</CardTitle><CardDescription className="text-primary-foreground/70">Select a duration and the apps you want to avoid.</CardDescription></div>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Duration</FieldLabel>
              <ToggleGroup type="single" value={String(duration)} onValueChange={(value) => value && setDuration(Number(value))} variant="outline" className="grid grid-cols-5">
                {durations.map((minutes) => <ToggleGroupItem key={minutes} value={String(minutes)}>{minutes}</ToggleGroupItem>)}
              </ToggleGroup>
              <div className="flex items-center gap-3 pt-2"><Timer className="text-primary" /><Slider value={[duration]} min={5} max={120} step={5} onValueChange={(value) => setDuration(value[0] ?? 25)} /><Badge variant="secondary">{duration}m</Badge></div>
            </Field>
            <Field>
              <FieldLabel>Distracting apps</FieldLabel>
              <div className="flex flex-col gap-2">
                {appUsage.slice(0, 5).map((app) => (
                  <Field key={app.id} orientation="horizontal" className="rounded-xl border p-3">
                    <Checkbox id={`focus-${app.id}`} checked={selectedApps.includes(app.appName)} onCheckedChange={(checked) => toggleApp(app.appName, checked === true)} />
                    <AppIcon app={app} className="size-10" />
                    <FieldContent><FieldTitle><label htmlFor={`focus-${app.id}`}>{app.appName}</label></FieldTitle><FieldDescription>{app.category}</FieldDescription></FieldContent>
                  </Field>
                ))}
              </div>
            </Field>
            <Button size="lg" disabled={!selectedApps.length || !appUsage.length} onClick={() => start(duration * 60, selectedApps)}><Play data-icon="inline-start" /> Start Focus</Button>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] shadow-sm">
        <CardHeader><CardTitle>Focus History</CardTitle><CardDescription>Your recent protected sessions</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-3">
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
