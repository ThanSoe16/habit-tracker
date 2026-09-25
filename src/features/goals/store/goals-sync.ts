import { reportSettingsSync } from '@/features/settings/sync-status';
import { onIdentityChange } from '@/lib/supabase/identity-scope';
import { goalsService } from '../services/supabase';
import type { Goal, GoalSettings } from '../types';

export type GoalsSnapshot = { goals: Goal[]; settings: GoalSettings };

let active = false;

export function activateGoalsSync() {
  active = true;
}

export function isGoalsSyncActive() {
  return active;
}

export async function syncGoalsDelta(current: GoalsSnapshot, previous: GoalsSnapshot) {
  const previousById = new Map(previous.goals.map((goal) => [goal.id, goal]));
  const currentIds = new Set(current.goals.map((goal) => goal.id));

  for (const goal of current.goals) {
    const old = previousById.get(goal.id);
    if (!old || JSON.stringify(old) !== JSON.stringify(goal)) {
      await goalsService.saveGoal(goal);
    }
  }
  for (const goal of previous.goals) {
    if (!currentIds.has(goal.id)) await goalsService.deleteGoal(goal.id);
  }
  if (current.settings.showCompletedOnHome !== previous.settings.showCompletedOnHome) {
    await goalsService.saveSettings(current.settings);
  }
}

export function createGoalsSyncScheduler(onSaved: () => void, delayMs = 250) {
  type Delta = { current: GoalsSnapshot; previous: GoalsSnapshot };
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: Delta | undefined;
  const queue: Delta[] = [];
  let running = false;
  let failed = false;
  let revision = 0;
  let generation = 0;

  onIdentityChange(() => {
    active = false;
    generation++;
    revision++;
    if (timer) clearTimeout(timer);
    timer = undefined;
    pending = undefined;
    queue.length = 0;
    running = false;
    failed = false;
  });

  async function flush() {
    if (running) return;
    const currentGeneration = generation;
    running = true;
    failed = false;
    reportSettingsSync('goals', 'saving', retry);
    while (queue.length) {
      try {
        await syncGoalsDelta(queue[0].current, queue[0].previous);
        if (generation !== currentGeneration) return;
        queue.shift();
      } catch {
        if (generation !== currentGeneration) return;
        running = false;
        failed = true;
        reportSettingsSync('goals', 'error', retry, 'Could not sync goals. Please retry.');
        return;
      }
    }
    running = false;
    if (!pending) {
      reportSettingsSync('goals', 'saved', retry);
      onSaved();
    }
  }

  function retry() {
    void flush();
  }

  return {
    get hasPending() {
      return running || !!pending || queue.length > 0;
    },
    get revision() {
      return revision;
    },
    schedule(current: GoalsSnapshot, previous: GoalsSnapshot) {
      if (current.goals === previous.goals && current.settings === previous.settings) return;
      revision++;
      pending = pending ? { current, previous: pending.previous } : { current, previous };
      if (!failed) reportSettingsSync('goals', 'saving', retry);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (pending) queue.push(pending);
        pending = undefined;
        timer = undefined;
        if (!failed) void flush();
      }, delayMs);
    },
  };
}
