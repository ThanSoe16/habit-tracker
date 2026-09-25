'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { reportSettingsSync } from '@/features/settings/sync-status';
import {
  assertIdentityRevision,
  identityRevision,
  isPartitioningStores,
} from '@/lib/supabase/identity-scope';
import { goalsService } from '../services/supabase';
import { createGoalsSyncScheduler, isGoalsSyncActive } from './goals-sync';
import type {
  CreateGoalValues,
  EditGoalValues,
  Goal,
  GoalSavingValues,
  GoalSettings,
  GoalStatus,
} from '../types';

const DEFAULT_GOAL_SETTINGS: GoalSettings = {
  showCompletedOnHome: true,
};

type GoalsState = {
  goals: Goal[];
  settings: GoalSettings;
  ready: boolean;
};

type GoalsActions = {
  fetchFromSupabase: () => Promise<void>;
  addGoal: (values: CreateGoalValues) => void;
  updateGoalDetails: (goalId: string, values: EditGoalValues) => void;
  updateStatus: (goalId: string, status: Exclude<GoalStatus, 'completed'>) => void;
  addSaving: (goalId: string, values: GoalSavingValues) => void;
  addSubIdea: (goalId: string, text: string) => void;
  toggleSubIdea: (goalId: string, subIdeaId: string) => void;
  completeGoal: (goalId: string, completionNote: string, energyScore: number) => void;
  reopenGoal: (goalId: string) => void;
  deleteGoal: (goalId: string) => void;
  updateSettings: (updates: Partial<GoalSettings>) => void;
  clearCompletedGoals: () => void;
};

function createInitialState(): GoalsState {
  return { goals: [], settings: DEFAULT_GOAL_SETTINGS, ready: false };
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitPlaces(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalAmount(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const amount = Number(trimmed);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function parseRequiredAmount(value: string) {
  const amount = Number(value.trim());
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function normalizeGoal(goal: Goal): Goal {
  return {
    ...goal,
    targetAmount: goal.targetAmount ?? null,
    currency: goal.currency ?? 'USDT',
    savings: Array.isArray(goal.savings) ? goal.savings : [],
  };
}

let isApplyingRemoteGoalsState = false;
let fetchingGoalsRevision: number | null = null;
const goalsSyncScheduler = createGoalsSyncScheduler(() => {
  void useGoalsStore.getState().fetchFromSupabase();
});

export const useGoalsStore = create<GoalsState & GoalsActions>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      fetchFromSupabase: async () => {
        const accountRevision = identityRevision();
        if (goalsSyncScheduler.hasPending) return;
        if (fetchingGoalsRevision === accountRevision) return;
        fetchingGoalsRevision = accountRevision;
        const syncRevision = goalsSyncScheduler.revision;
        try {
          let remote = await goalsService.fetchSnapshot();
          assertIdentityRevision(accountRevision);
          if (goalsSyncScheduler.hasPending || syncRevision !== goalsSyncScheduler.revision) return;

          const migrationKey = `goals-cloud-migrated:${remote.userId}`;
          if (!localStorage.getItem(migrationKey)) {
            const local = get();
            const remoteById = new Map(remote.goals.map((goal) => [goal.id, goal]));
            const imports = local.goals.filter((goal) => {
              const saved = remoteById.get(goal.id);
              return !saved || goal.updatedAt > saved.updatedAt;
            });
            const importSettings =
              local.settings.showCompletedOnHome !== DEFAULT_GOAL_SETTINGS.showCompletedOnHome &&
              remote.settings.showCompletedOnHome === DEFAULT_GOAL_SETTINGS.showCompletedOnHome;
            if (imports.length || importSettings) {
              reportSettingsSync('goals', 'saving', () => void get().fetchFromSupabase());
              for (const goal of imports) {
                await goalsService.saveGoal(goal);
                assertIdentityRevision(accountRevision);
              }
              if (importSettings) {
                await goalsService.saveSettings(local.settings);
                assertIdentityRevision(accountRevision);
              }
              remote = await goalsService.fetchSnapshot();
              assertIdentityRevision(accountRevision);
            }
            if (goalsSyncScheduler.hasPending || syncRevision !== goalsSyncScheduler.revision)
              return;
            localStorage.setItem(migrationKey, '1');
          }

          isApplyingRemoteGoalsState = true;
          try {
            set({ goals: remote.goals, settings: remote.settings, ready: true });
          } finally {
            isApplyingRemoteGoalsState = false;
          }
          reportSettingsSync('goals', 'saved', () => void get().fetchFromSupabase());
        } catch (error) {
          if (identityRevision() !== accountRevision) return;
          set({ ready: true });
          reportSettingsSync(
            'goals',
            'error',
            () => void get().fetchFromSupabase(),
            'Could not load goals. Please retry.',
          );
          throw error;
        } finally {
          if (fetchingGoalsRevision === accountRevision) fetchingGoalsRevision = null;
        }
      },
      addGoal: (values) =>
        set((state) => {
          const now = new Date().toISOString();
          const goal: Goal = {
            id: crypto.randomUUID(),
            title: values.title.trim(),
            why: values.why.trim(),
            targetDate: values.targetDate,
            targetAmount: parseOptionalAmount(values.targetAmountText),
            currency: values.currency,
            savings: [],
            places: splitPlaces(values.placesText),
            subIdeas: splitLines(values.subIdeasText).map((text) => ({
              id: crypto.randomUUID(),
              text,
              isDone: false,
              createdAt: now,
            })),
            status: 'idea',
            completionNote: '',
            energyScore: null,
            completedAt: null,
            createdAt: now,
            updatedAt: now,
          };

          return { goals: [goal, ...state.goals] };
        }),
      updateGoalDetails: (goalId, values) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  title: values.title.trim(),
                  why: values.why.trim(),
                  targetDate: values.targetDate,
                  targetAmount: parseOptionalAmount(values.targetAmountText),
                  currency: values.currency,
                  places: splitPlaces(values.placesText),
                  updatedAt: new Date().toISOString(),
                }
              : goal,
          ),
        })),
      updateStatus: (goalId, status) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  status,
                  completedAt: null,
                  completionNote: '',
                  energyScore: null,
                  updatedAt: new Date().toISOString(),
                }
              : goal,
          ),
        })),
      addSaving: (goalId, values) =>
        set((state) => {
          const amount = parseRequiredAmount(values.amountText);
          if (amount <= 0) return state;
          const now = new Date().toISOString();
          const savedAt = values.savedAt || now.slice(0, 10);

          return {
            goals: state.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    savings: [
                      {
                        id: crypto.randomUUID(),
                        amount,
                        note: values.note.trim(),
                        savedAt,
                        createdAt: now,
                      },
                      ...goal.savings,
                    ],
                    updatedAt: now,
                  }
                : goal,
            ),
          };
        }),
      addSubIdea: (goalId, text) =>
        set((state) => {
          const nextText = text.trim();
          if (!nextText) return state;
          const now = new Date().toISOString();

          return {
            goals: state.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    subIdeas: [
                      ...goal.subIdeas,
                      { id: crypto.randomUUID(), text: nextText, isDone: false, createdAt: now },
                    ],
                    updatedAt: now,
                  }
                : goal,
            ),
          };
        }),
      toggleSubIdea: (goalId, subIdeaId) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  subIdeas: goal.subIdeas.map((subIdea) =>
                    subIdea.id === subIdeaId ? { ...subIdea, isDone: !subIdea.isDone } : subIdea,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : goal,
          ),
        })),
      completeGoal: (goalId, completionNote, energyScore) =>
        set((state) => {
          const now = new Date().toISOString();

          return {
            goals: state.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    status: 'completed',
                    completionNote: completionNote.trim(),
                    energyScore,
                    completedAt: now,
                    updatedAt: now,
                  }
                : goal,
            ),
          };
        }),
      reopenGoal: (goalId) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  status: 'in_progress',
                  completedAt: null,
                  updatedAt: new Date().toISOString(),
                }
              : goal,
          ),
        })),
      deleteGoal: (goalId) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== goalId),
        })),
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      clearCompletedGoals: () =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.status !== 'completed'),
        })),
    }),
    {
      name: 'goals-store',
      skipHydration: true,
      version: 3,
      migrate: (persisted) => {
        if (!persisted || typeof persisted !== 'object') return createInitialState();
        const state = persisted as Partial<GoalsState>;
        return {
          goals: Array.isArray(state.goals) ? state.goals.map((goal) => normalizeGoal(goal)) : [],
          settings: { ...DEFAULT_GOAL_SETTINGS, ...(state.settings ?? {}) },
          ready: false,
        };
      },
      partialize: (state) => ({ goals: state.goals, settings: state.settings }),
    },
  ),
);

useGoalsStore.subscribe((state, previousState) => {
  if (isApplyingRemoteGoalsState || isPartitioningStores() || !isGoalsSyncActive()) return;
  goalsSyncScheduler.schedule(
    { goals: state.goals, settings: state.settings },
    { goals: previousState.goals, settings: previousState.settings },
  );
});
