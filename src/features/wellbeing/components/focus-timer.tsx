'use client';

import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFocusSessionStore } from '../store/use-focus-session-store';
import { formatTimer } from '../utils/format-duration';

export function FocusTimer() {
  const { activeSession, pause, resume, extend, end } = useFocusSessionStore();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeSession || activeSession.status === 'PAUSED') return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeSession]);

  const effectiveNow =
    activeSession?.status === 'PAUSED' && activeSession.pausedAt
      ? new Date(activeSession.pausedAt).getTime()
      : now;
  const remaining = activeSession
    ? Math.max(0, Math.ceil((new Date(activeSession.endsAt).getTime() - effectiveNow) / 1000))
    : 0;

  useEffect(() => {
    if (activeSession?.status === 'ACTIVE' && remaining === 0) end(true);
  }, [activeSession?.status, end, remaining]);

  if (!activeSession) return null;
  const progress = Math.min(
    100,
    ((activeSession.plannedDurationSeconds - remaining) / activeSession.plannedDurationSeconds) * 100,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-5 py-4">
        <div className="flex size-60 items-center justify-center rounded-full p-4" style={{ background: `conic-gradient(var(--primary) ${progress * 3.6}deg, var(--muted) 0deg)` }}>
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-card shadow-inner">
            <p className="text-4xl font-black tabular-nums">{formatTimer(remaining)}</p>
            <p className="mt-2 text-xs text-muted-foreground">{activeSession.status === 'PAUSED' ? 'Session paused' : 'Remaining focus time'}</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2">
          <p className="text-xs font-bold uppercase text-muted-foreground">Distracting apps</p>
          {activeSession.selectedApps.map((app) => <div key={app} className="rounded-xl border bg-background p-3 text-sm font-semibold">{app}</div>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => extend(900)}>+15 min</Button>
        <Button variant="outline" onClick={activeSession.status === 'PAUSED' ? resume : pause}>
          {activeSession.status === 'PAUSED' ? <Play data-icon="inline-start" /> : <Pause data-icon="inline-start" />}
          {activeSession.status === 'PAUSED' ? 'Resume' : 'Pause'}
        </Button>
      </div>
      <Button variant="destructive" onClick={() => end(false)}>End Session</Button>
    </div>
  );
}
