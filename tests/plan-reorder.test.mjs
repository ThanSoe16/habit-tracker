import assert from 'node:assert/strict';
import test from 'node:test';
import { reorderPlanExercises } from '../src/features/gym/store/reorder-plan-exercises.ts';
import { useGymStore } from '../src/store/use-gym-store.ts';
import { gymService } from '../src/features/gym/services/supabase.ts';
import { applyRemoteGymState } from '../src/features/gym/store/gym-sync.ts';

const exercise = (id) => ({
  id,
  exerciseId: `exercise-${id}`,
  name: id,
  category: 'Chest',
  targetSets: 3,
  targetReps: '8-12',
  weight: '20kg',
  setsDetails: [{ setNumber: 1, reps: 10, weightKg: 20 }],
});
const a = exercise('a'),
  b = exercise('b'),
  c = exercise('c');
const day = {
  dayIndex: 0,
  dayName: 'Day 1',
  title: 'Chest',
  isRestDay: false,
  exercises: [a, b, c],
};
const otherDay = { ...day, dayIndex: 1, exercises: [exercise('d')] };
const ids = (exercises) => exercises.map((item) => item.id);

test('moves exercises in both directions without modifying details or another day', () => {
  const result = reorderPlanExercises([day, otherDay], {}, 0, 'a', 'c');
  assert.deepEqual(ids(result.weeklyPlan[0].exercises), ['b', 'c', 'a']);
  assert.equal(result.weeklyPlan[0].exercises[2], a);
  assert.equal(result.weeklyPlan[1], otherDay);
  assert.deepEqual(ids(day.exercises), ['a', 'b', 'c']);
  const restored = reorderPlanExercises(result.weeklyPlan, {}, 0, 'a', 'b');
  assert.deepEqual(ids(restored.weeklyPlan[0].exercises), ['a', 'b', 'c']);
});

test('invalid, unchanged, and rest-day drops do nothing', () => {
  for (const [dayIndex, active, over] of [
    [9, 'a', 'b'],
    [0, 'missing', 'b'],
    [0, 'a', 'missing'],
    [0, 'a', 'a'],
  ]) {
    assert.equal(reorderPlanExercises([day], {}, dayIndex, active, over), null);
  }
  assert.equal(reorderPlanExercises([{ ...day, isRestDay: true }], {}, 0, 'a', 'b'), null);
});

test('unfinished workouts follow the plan while completed history and progress are preserved', () => {
  const loggedA = { ...a, completedSets: 2, completed: false };
  const loggedB = { ...b, completedSets: 3, completed: true };
  const log = {
    id: 'log',
    date: '2026-09-07',
    dayIndex: 0,
    dayTitle: 'Chest',
    completed: false,
    exercises: [loggedA, loggedB, { ...c, completedSets: 0, completed: false }],
  };
  const completed = { ...log, completed: true };
  const unrelated = { ...log, dayIndex: 1 };
  const history = { open: log, done: completed, other: unrelated };
  const result = reorderPlanExercises([otherDay, day], history, 0, 'b', 'a');
  assert.deepEqual(ids(result.history.open.exercises), ['b', 'a', 'c']);
  assert.equal(result.history.open.exercises[0], loggedB);
  assert.equal(result.history.open.exercises[1], loggedA);
  assert.equal(result.history.open.exercises[1].setsDetails, a.setsDetails);
  assert.equal(result.history.done, completed);
  assert.equal(result.history.other, unrelated);
  assert.deepEqual(ids(history.open.exercises), ['a', 'b', 'c']);
});

test('duplicate exercise definitions use unique plan-entry IDs for sorting', () => {
  const duplicate = { ...a, id: 'second-a' };
  const result = reorderPlanExercises(
    [{ ...day, exercises: [a, duplicate, b] }],
    {},
    0,
    'second-a',
    'b',
  );
  assert.deepEqual(ids(result.weeklyPlan[0].exercises), ['a', 'b', 'second-a']);
});

test('the store persists the latest rapid reorder through the existing plan save path', async (t) => {
  const original = useGymStore.getState();
  t.after(() => applyRemoteGymState(() => useGymStore.setState(original, true)));
  const writes = [];
  let complete;
  const saved = new Promise((resolve) => {
    complete = resolve;
  });
  t.mock.method(gymService, 'upsertGymPlan', async (plan) => {
    writes.push(plan);
    complete();
  });
  applyRemoteGymState(() => useGymStore.setState({ weeklyPlan: [day, otherDay], history: {} }));
  useGymStore.getState().reorderExercisesInDay(0, 'a', 'c');
  useGymStore.getState().reorderExercisesInDay(0, 'c', 'b');
  await saved;
  assert.equal(writes.length, 1);
  assert.equal(writes[0].dayIndex, 0);
  assert.deepEqual(ids(writes[0].exercises), ['c', 'b', 'a']);
  assert.equal(writes[0].exercises[2].setsDetails, a.setsDetails);
  const before = useGymStore.getState();
  before.reorderExercisesInDay(0, 'missing', 'a');
  assert.equal(useGymStore.getState(), before);
});
