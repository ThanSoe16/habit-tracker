import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { useGymStore } from '../src/store/use-gym-store.ts';
import { gymService } from '../src/features/gym/services/supabase.ts';
import { gymBodyMetricsService } from '../src/features/gym/services/body-metrics.ts';
import { applyRemoteGymState, saveWorkoutLog } from '../src/features/gym/store/gym-sync.ts';
import { setIdentityScope } from '../src/lib/supabase/identity-scope.ts';
import { workoutLogSchema, DEFAULT_GYM_SETTINGS } from '../src/features/gym/store/model.ts';

const date = '2026-10-05';
const exercise = {
  id: 'squat',
  exerciseId: 'squat',
  name: 'Squat',
  category: 'Legs',
  targetSets: 3,
  targetReps: '8-12',
};
const plan = [
  { dayIndex: 0, dayName: 'Monday', title: 'Legs', isRestDay: false, exercises: [exercise] },
];
const state = () => useGymStore.getState();
const log = () => state().history[date];
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

beforeEach((t) => {
  setIdentityScope('workout-test-user');
  applyRemoteGymState(() =>
    useGymStore.setState({ history: {}, weeklyPlan: plan, gymSettings: DEFAULT_GYM_SETTINGS }),
  );
  t.mock.method(gymService, 'upsertWorkoutLog', async (_date, value) => structuredClone(value));
});

test('unstarted exercises cannot change and finishing cannot create a session', async () => {
  state().updateCompletedSet(date, exercise.id, 1);
  state().toggleExerciseDone(date, exercise.id);
  await state().finishWorkout(date);
  assert.equal(log(), undefined);
  assert.equal(gymService.upsertWorkoutLog.mock.callCount(), 0);
});

test('start unlocks only after persistence and preserves the original timestamp on repeated starts', async () => {
  const pending = deferred();
  const save = gymService.upsertWorkoutLog.mock;
  save.mockImplementation(async (_date, value) => {
    await pending.promise;
    return value;
  });
  const starting = state().startWorkout(date);
  assert.equal(log(), undefined);
  state().updateCompletedSet(date, exercise.id, 1);
  pending.resolve();
  await starting;
  const startedAt = log().startedAt;
  assert.ok(Number.isFinite(Date.parse(startedAt)));
  assert.equal(log().exercises[0].completedSets, 0);
  await state().startWorkout(date);
  assert.equal(log().startedAt, startedAt);
  assert.equal(save.callCount(), 1);
});

test('session ends explicitly, preserves actual sets, and note edits preserve both timestamps', async () => {
  await state().startWorkout(date);
  const startedAt = log().startedAt;
  state().updateCompletedSet(date, exercise.id, 1);
  await state().finishWorkout(date, 'Good workout');
  const completedAt = log().completedAt;
  assert.ok(completedAt >= startedAt);
  assert.equal(log().completed, true);
  assert.equal(log().exercises[0].completedSets, 1);
  state().updateCompletedSet(date, exercise.id, 1);
  state().toggleExerciseDone(date, exercise.id);
  assert.equal(log().exercises[0].completedSets, 1);
  await state().finishWorkout(date, 'Updated notes');
  assert.equal(log().startedAt, startedAt);
  assert.equal(log().completedAt, completedAt);
  assert.equal(log().notes, 'Updated notes');
  assert.deepEqual(
    workoutLogSchema.parse(JSON.parse(JSON.stringify(log()))),
    JSON.parse(JSON.stringify(log())),
  );
});

test('checking the final set waits for Complete even with a legacy auto-finish preference', async () => {
  applyRemoteGymState(() =>
    useGymStore.setState({ gymSettings: { ...DEFAULT_GYM_SETTINGS, autoFinishWorkout: true } }),
  );
  await state().startWorkout(date);
  state().toggleExerciseDone(date, exercise.id);
  assert.equal(log().exercises[0].completed, true);
  assert.equal(log().completed, false);
  assert.equal(log().completedAt, undefined);
  await saveWorkoutLog(date, log());
});

test('failed start and completion retain state and support retry', async () => {
  gymService.upsertWorkoutLog.mock.mockImplementationOnce(async () => {
    throw new Error('offline');
  });
  await assert.rejects(state().startWorkout(date), /offline/);
  assert.equal(log(), undefined);
  await state().startWorkout(date);
  const started = log();
  gymService.upsertWorkoutLog.mock.mockImplementationOnce(async () => {
    throw new Error('offline');
  });
  await assert.rejects(state().finishWorkout(date, 'Keep these notes'), /offline/);
  assert.equal(log(), started);
  await state().finishWorkout(date, 'Keep these notes');
  assert.equal(log().notes, 'Keep these notes');
  assert.equal(log().completed, true);
});

test('legacy partial progress survives starting, while completed history gains no invented start time', async () => {
  const legacy = {
    ...state().getWorkoutLogForDate(date),
    id: 'legacy',
    exercises: [{ ...exercise, completedSets: 2, completed: false }],
  };
  applyRemoteGymState(() => useGymStore.setState({ history: { [date]: legacy } }));
  await state().startWorkout(date);
  assert.equal(log().id, 'legacy');
  assert.equal(log().exercises[0].completedSets, 2);
  const oldEnd = '2026-10-05T06:00:00.000Z';
  applyRemoteGymState(() =>
    useGymStore.setState({
      history: { [date]: { ...legacy, completed: true, completedAt: oldEnd } },
    }),
  );
  await state().startWorkout(date);
  await state().finishWorkout(date, 'History note');
  assert.equal(log().startedAt, undefined);
  assert.equal(log().completedAt, oldEnd);
});

test('an older remote snapshot cannot erase a start saved during refresh', async (t) => {
  const pending = deferred();
  t.mock.method(gymService, 'fetchGymPlans', () => pending.promise);
  t.mock.method(gymService, 'fetchCustomExercises', async () => []);
  t.mock.method(gymService, 'fetchWorkoutLogs', async () => ({}));
  t.mock.method(gymService, 'fetchGymSettings', async () => DEFAULT_GYM_SETTINGS);
  t.mock.method(gymBodyMetricsService, 'fetchLogs', async () => []);
  const refreshing = state().fetchFromSupabase();
  await state().startWorkout(date);
  const started = log();
  pending.resolve(plan);
  await refreshing;
  assert.equal(log(), started);
});

test('an account change while saving cannot apply the old workout to the new account', async () => {
  const pending = deferred();
  const requested = deferred();
  gymService.upsertWorkoutLog.mock.mockImplementation(async (_date, value) => {
    requested.resolve();
    await pending.promise;
    return value;
  });
  const starting = state().startWorkout(date);
  await requested.promise;
  setIdentityScope('another-user');
  pending.resolve();
  await assert.rejects(starting, /session changed/);
  assert.equal(log(), undefined);
});
