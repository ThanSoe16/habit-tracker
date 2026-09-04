'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { digitalWellbeingService } from '../services/supabase';

export interface ActiveFocusSession {
  id: string;
  startedAt: string;
  endsAt: string;
  plannedDurationSeconds: number;
  status: 'ACTIVE' | 'PAUSED';
  pausedAt: string | null;
  selectedApps: string[];
  pauseCount: number;
}

interface FocusSessionStore {
  activeSession: ActiveFocusSession | null;
  start: (durationSeconds: number, selectedApps: string[]) => void;
  pause: () => void;
  resume: () => void;
  extend: (seconds: number) => void;
  end: (completed?: boolean) => void;
}

export const useFocusSessionStore = create<FocusSessionStore>()(
  persist(
    (set, get) => ({
      activeSession: null,
      start: (durationSeconds, selectedApps) => {
        const startedAt = new Date();
        const safeDuration = Math.max(60, Math.round(durationSeconds));
        const id = crypto.randomUUID();
        set({
          activeSession: {
            id,
            startedAt: startedAt.toISOString(),
            endsAt: new Date(startedAt.getTime() + safeDuration * 1000).toISOString(),
            plannedDurationSeconds: safeDuration,
            status: 'ACTIVE',
            pausedAt: null,
            selectedApps,
            pauseCount: 0,
          },
        });
        void digitalWellbeingService.startFocusSession(id, startedAt.toISOString(), safeDuration, selectedApps)
          .catch((error) => console.warn('Failed to create focus session:', error));
      },
      pause: () => {
        const session = get().activeSession;
        if (!session || session.status === 'PAUSED') return;
        const updated = { ...session, status: 'PAUSED' as const, pausedAt: new Date().toISOString(), pauseCount: session.pauseCount + 1 };
        set({ activeSession: updated });
        const completed = Math.max(0, session.plannedDurationSeconds - Math.ceil((new Date(session.endsAt).getTime() - Date.now()) / 1000));
        void digitalWellbeingService.updateFocusSession(session.id, { status: 'PAUSED', plannedDurationSeconds: session.plannedDurationSeconds, completedDurationSeconds: completed, pauseCount: updated.pauseCount }).catch(console.warn);
      },
      resume: () => {
        const session = get().activeSession;
        if (!session || session.status !== 'PAUSED' || !session.pausedAt) return;
        const pausedFor = Date.now() - new Date(session.pausedAt).getTime();
        const updated = { ...session, status: 'ACTIVE' as const, pausedAt: null, endsAt: new Date(new Date(session.endsAt).getTime() + pausedFor).toISOString() };
        set({ activeSession: updated });
        void digitalWellbeingService.updateFocusSession(session.id, { status: 'ACTIVE', plannedDurationSeconds: session.plannedDurationSeconds, completedDurationSeconds: Math.max(0, session.plannedDurationSeconds - Math.ceil((new Date(session.endsAt).getTime() - new Date(session.pausedAt).getTime()) / 1000)), pauseCount: session.pauseCount }).catch(console.warn);
      },
      extend: (seconds) => {
        const session = get().activeSession;
        if (!session) return;
        const extra = Math.max(60, Math.round(seconds));
        const updated = { ...session, endsAt: new Date(new Date(session.endsAt).getTime() + extra * 1000).toISOString(), plannedDurationSeconds: session.plannedDurationSeconds + extra };
        set({ activeSession: updated });
        void digitalWellbeingService.updateFocusSession(session.id, { status: session.status, plannedDurationSeconds: updated.plannedDurationSeconds, completedDurationSeconds: Math.max(0, session.plannedDurationSeconds - Math.ceil((new Date(session.endsAt).getTime() - Date.now()) / 1000)), pauseCount: session.pauseCount }).catch(console.warn);
      },
      end: (completed = false) => {
        const session = get().activeSession;
        if (!session) return;
        const endedAt = new Date().toISOString();
        const elapsed = Math.max(0, session.plannedDurationSeconds - Math.ceil((new Date(session.endsAt).getTime() - Date.now()) / 1000));
        set({ activeSession: null });
        void digitalWellbeingService.updateFocusSession(session.id, { status: completed ? 'COMPLETED' : 'CANCELLED', plannedDurationSeconds: session.plannedDurationSeconds, completedDurationSeconds: completed ? session.plannedDurationSeconds : Math.min(session.plannedDurationSeconds, elapsed), pauseCount: session.pauseCount, endedAt }).catch(console.warn);
      },
    }),
    { name: 'digital-wellbeing-focus-session' },
  ),
);
