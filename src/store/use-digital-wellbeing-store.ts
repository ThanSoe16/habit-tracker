'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wellbeingService } from '@/features/wellbeing/services/supabase';

export const SOCIAL_PLATFORMS = [
  'Instagram',
  'TikTok',
  'Facebook',
  'YouTube',
  'X',
  'Reddit',
  'Other',
] as const;

export const URGE_TRIGGERS = [
  'Bored',
  'Stressed',
  'Procrastinating',
  'Lonely',
  'Habit',
  'Notification',
  'Other',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type UrgeTrigger = (typeof URGE_TRIGGERS)[number];
export type UrgeOutcome = 'avoided' | 'opened';
export type LimitAction = 'block' | 'remind';

export interface SocialSession {
  id: string;
  platform: SocialPlatform;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

export interface ActiveSocialSession {
  id: string;
  platform: SocialPlatform;
  startedAt: string;
}

export interface ActiveFocusSession {
  startedAt: string;
  endsAt: string;
  durationMinutes: number;
}

export interface SocialUrge {
  id: string;
  platform: SocialPlatform;
  trigger: UrgeTrigger;
  outcome: UrgeOutcome;
  createdAt: string;
}

interface DigitalWellbeingStore {
  isLoaded: boolean;
  dailyLimitMinutes: number;
  reminderIntervalMinutes: number;
  limitAction: LimitAction;
  applyWeekdays: boolean;
  applyWeekends: boolean;
  activeSession: ActiveSocialSession | null;
  activeFocus: ActiveFocusSession | null;
  sessions: SocialSession[];
  urges: SocialUrge[];
  fetchFromSupabase: () => Promise<void>;
  setGoals: (dailyLimitMinutes: number, reminderIntervalMinutes: number) => void;
  setLimitPreferences: (preferences: {
    limitAction: LimitAction;
    applyWeekdays: boolean;
    applyWeekends: boolean;
  }) => void;
  startSession: (platform: SocialPlatform) => void;
  stopSession: () => void;
  startFocus: (minutes: number) => void;
  extendFocus: (minutes: number) => void;
  endFocus: () => void;
  logUrge: (urge: Omit<SocialUrge, 'id' | 'createdAt'>) => void;
}

export const useDigitalWellbeingStore = create<DigitalWellbeingStore>()(
  persist(
    (set, get) => ({
      isLoaded: false,
      dailyLimitMinutes: 60,
      reminderIntervalMinutes: 10,
      limitAction: 'block',
      applyWeekdays: true,
      applyWeekends: false,
      activeSession: null,
      activeFocus: null,
      sessions: [],
      urges: [],

      fetchFromSupabase: async () => {
        try {
          const remote = await wellbeingService.fetchData();
          if (!remote) {
            set({ isLoaded: true });
            return;
          }

          const localSessions = get().sessions;
          const localUrges = get().urges;
          const localDailyLimit = get().dailyLimitMinutes;
          const localReminderInterval = get().reminderIntervalMinutes;
          const sessionMap = new Map(
            [...localSessions, ...remote.sessions].map((session) => [session.id, session]),
          );
          const urgeMap = new Map([...localUrges, ...remote.urges].map((urge) => [urge.id, urge]));
          const sessions = [...sessionMap.values()].sort((a, b) =>
            b.startedAt.localeCompare(a.startedAt),
          );
          const urges = [...urgeMap.values()].sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
          );

          set({
            dailyLimitMinutes: remote.dailyLimitMinutes ?? localDailyLimit,
            reminderIntervalMinutes: remote.reminderIntervalMinutes ?? localReminderInterval,
            sessions,
            urges,
            isLoaded: true,
          });

          const remoteSessionIds = new Set(remote.sessions.map((session) => session.id));
          const remoteUrgeIds = new Set(remote.urges.map((urge) => urge.id));
          const pendingMigration: Promise<void>[] = [
            ...localSessions
              .filter((session) => !remoteSessionIds.has(session.id))
              .map((session) => wellbeingService.upsertSession(session)),
            ...localUrges
              .filter((urge) => !remoteUrgeIds.has(urge.id))
              .map((urge) => wellbeingService.upsertUrge(urge)),
          ];
          if (remote.dailyLimitMinutes === null || remote.reminderIntervalMinutes === null) {
            pendingMigration.push(
              wellbeingService.upsertProfile(localDailyLimit, localReminderInterval),
            );
          }
          if (pendingMigration.length) await Promise.allSettled(pendingMigration);
        } catch (error) {
          console.warn('Failed to fetch digital wellbeing data:', error);
          set({ isLoaded: true });
        }
      },

      setGoals: (dailyLimit, reminderInterval) => {
        const dailyLimitMinutes = Math.max(1, Math.round(dailyLimit));
        const reminderIntervalMinutes = Math.max(1, Math.round(reminderInterval));
        set({ dailyLimitMinutes, reminderIntervalMinutes });
        void wellbeingService
          .upsertProfile(dailyLimitMinutes, reminderIntervalMinutes)
          .catch((error) => console.warn('Failed to sync wellbeing goals:', error));
      },

      setLimitPreferences: (preferences) => set(preferences),

      startSession: (platform) => {
        if (get().activeSession) return;

        set({
          activeSession: {
            id: crypto.randomUUID(),
            platform,
            startedAt: new Date().toISOString(),
          },
        });
      },

      stopSession: () => {
        const activeSession = get().activeSession;
        if (!activeSession) return;

        const endedAt = new Date();
        const durationSeconds = Math.max(
          1,
          Math.round((endedAt.getTime() - new Date(activeSession.startedAt).getTime()) / 1000),
        );

        const completedSession: SocialSession = {
          ...activeSession,
          endedAt: endedAt.toISOString(),
          durationSeconds,
        };

        set((state) => ({
          activeSession: null,
          sessions: [completedSession, ...state.sessions],
        }));
        void wellbeingService
          .upsertSession(completedSession)
          .catch((error) => console.warn('Failed to sync social session:', error));
      },

      startFocus: (minutes) => {
        const durationMinutes = Math.max(1, Math.round(minutes));
        const startedAt = new Date();
        set({
          activeFocus: {
            startedAt: startedAt.toISOString(),
            endsAt: new Date(startedAt.getTime() + durationMinutes * 60_000).toISOString(),
            durationMinutes,
          },
        });
      },

      extendFocus: (minutes) => {
        const activeFocus = get().activeFocus;
        if (!activeFocus) return;
        const extraMinutes = Math.max(1, Math.round(minutes));
        set({
          activeFocus: {
            ...activeFocus,
            endsAt: new Date(
              new Date(activeFocus.endsAt).getTime() + extraMinutes * 60_000,
            ).toISOString(),
            durationMinutes: activeFocus.durationMinutes + extraMinutes,
          },
        });
      },

      endFocus: () => set({ activeFocus: null }),

      logUrge: (urge) => {
        const completedUrge: SocialUrge = {
          ...urge,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          urges: [completedUrge, ...state.urges],
        }));
        void wellbeingService
          .upsertUrge(completedUrge)
          .catch((error) => console.warn('Failed to sync social urge:', error));
      },
    }),
    { name: 'digital-wellbeing-store' },
  ),
);
