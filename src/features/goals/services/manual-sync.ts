import { assertIdentityRevision, identityRevision } from '@/lib/supabase/identity-scope';
import { syncGoalsDelta, type GoalsSnapshot } from '../store/goals-sync';
import { goalsService } from './supabase';

export const emptyGoalsSnapshot: GoalsSnapshot = {
  goals: [],
  settings: { showCompletedOnHome: true },
};

const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function countPendingGoals(current: GoalsSnapshot, baseline: GoalsSnapshot) {
  const previous = new Map(baseline.goals.map((goal) => [goal.id, goal]));
  const ids = new Set(current.goals.map((goal) => goal.id));
  return (
    current.goals.filter((goal) => !equal(goal, previous.get(goal.id))).length +
    baseline.goals.filter((goal) => !ids.has(goal.id)).length +
    Number(!equal(current.settings, baseline.settings))
  );
}

/** Apply a cloud response while retaining edits and deletions made during the request. */
export function reconcileGoals(
  current: GoalsSnapshot,
  submitted: GoalsSnapshot,
  remote: GoalsSnapshot,
): GoalsSnapshot {
  const submittedById = new Map(submitted.goals.map((goal) => [goal.id, goal]));
  const currentById = new Map(current.goals.map((goal) => [goal.id, goal]));
  const goals = remote.goals.filter(
    (goal) => !submittedById.has(goal.id) || currentById.has(goal.id),
  );
  for (const goal of current.goals) {
    if (!equal(goal, submittedById.get(goal.id))) {
      const index = goals.findIndex((remoteGoal) => remoteGoal.id === goal.id);
      if (index < 0) goals.push(goal);
      else goals[index] = goal;
    }
  }
  return {
    goals,
    settings: equal(current.settings, submitted.settings) ? remote.settings : current.settings,
  };
}

export async function syncManualGoals(
  userId: string,
  submitted: GoalsSnapshot,
  baseline: GoalsSnapshot,
) {
  const revision = identityRevision();
  // Read first to verify the session and ownership before replaying durable changes.
  const initial = await goalsService.fetchSnapshot();
  assertIdentityRevision(revision);
  if (initial.userId !== userId) throw new Error('Your session changed. Sign in again.');
  await syncGoalsDelta(submitted, baseline);
  assertIdentityRevision(revision);
  const remote = await goalsService.fetchSnapshot();
  assertIdentityRevision(revision);
  if (remote.userId !== userId) throw new Error('Your session changed. Sign in again.');
  return remote;
}
