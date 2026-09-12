import {
  identityRevision,
  isIdentityRevisionCurrent,
  onIdentityChange,
} from '@/lib/supabase/identity-scope';
import { gymService } from '@/features/gym/services/supabase';
import type { PlanDay, WorkoutLog } from './model';

const workoutLogSaveQueues = new Map<string, Promise<void>>();
const gymPlanSaveTimers = new Map<number, ReturnType<typeof setTimeout>>();
let isApplyingRemoteState = false;
onIdentityChange(() => {
  gymPlanSaveTimers.forEach(clearTimeout);
  gymPlanSaveTimers.clear();
  workoutLogSaveQueues.clear();
});

export function applyRemoteGymState(apply: () => void) {
  isApplyingRemoteState = true;
  try {
    apply();
  } finally {
    isApplyingRemoteState = false;
  }
}

export function isApplyingRemoteGymState() {
  return isApplyingRemoteState;
}

export function saveWorkoutLog(dateStr: string, log: WorkoutLog) {
  const revision = identityRevision();
  const previousSave = workoutLogSaveQueues.get(dateStr) ?? Promise.resolve();
  const nextSave = previousSave
    .catch(() => undefined)
    .then(() =>
      isIdentityRevisionCurrent(revision) ? gymService.upsertWorkoutLog(dateStr, log) : undefined,
    );

  workoutLogSaveQueues.set(dateStr, nextSave);
  void nextSave.finally(() => {
    if (workoutLogSaveQueues.get(dateStr) === nextSave) {
      workoutLogSaveQueues.delete(dateStr);
    }
  });
}

export function scheduleGymPlanSave(plan: PlanDay, delayMs = 250) {
  const revision = identityRevision();
  const currentTimer = gymPlanSaveTimers.get(plan.dayIndex);
  if (currentTimer) clearTimeout(currentTimer);

  const timer = setTimeout(() => {
    gymPlanSaveTimers.delete(plan.dayIndex);
    if (isIdentityRevisionCurrent(revision)) void gymService.upsertGymPlan(plan);
  }, delayMs);
  gymPlanSaveTimers.set(plan.dayIndex, timer);
}
