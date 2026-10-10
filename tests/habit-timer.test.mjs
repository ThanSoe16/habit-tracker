import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getInitialTimerSeconds,
  getTimerProgress,
  advanceHabitTimer,
} from '../src/features/habits/utils/timer-progress.ts';

test('a five-minute countdown saves two completed minutes with three remaining', () => {
  const initial = getInitialTimerSeconds(undefined, 300, true);
  assert.equal(initial, 300);
  assert.deepEqual(getTimerProgress(initial - 120, 300, true), {
    completedSeconds: 120,
    remainingSeconds: 180,
    timeTaken: '02:00',
    completed: false,
    percent: 40,
  });
});

test('countdown signals completion only when the running timer reaches zero', () => {
  assert.deepEqual(advanceHabitTimer(2, 300, true), { seconds: 1, reachedGoal: false });
  assert.deepEqual(advanceHabitTimer(1, 300, true), { seconds: 0, reachedGoal: true });
  assert.deepEqual(advanceHabitTimer(0, 300, true), { seconds: 0, reachedGoal: false });
});

test('count-up signals the goal once and continues without repeating the alert', () => {
  assert.deepEqual(advanceHabitTimer(299, 300, false), { seconds: 300, reachedGoal: true });
  assert.deepEqual(advanceHabitTimer(300, 300, false), { seconds: 301, reachedGoal: false });
  assert.deepEqual(advanceHabitTimer(301, 300, false), { seconds: 302, reachedGoal: false });
});

test('saved countdown progress resumes at the remaining time without reversing on each save', () => {
  let saved = '02:00';
  for (let i = 0; i < 3; i++) {
    const seconds = getInitialTimerSeconds(saved, 300, true);
    assert.equal(seconds, 180);
    saved = getTimerProgress(seconds, 300, true).timeTaken;
    assert.equal(saved, '02:00');
  }
});

test('countdown starts and resets with no completed progress, then completes at zero', () => {
  const reset = getTimerProgress(getInitialTimerSeconds(undefined, 300, true), 300, true);
  assert.equal(reset.timeTaken, '00:00');
  assert.equal(reset.completed, false);
  assert.equal(reset.percent, 0);
  const finished = getTimerProgress(0, 300, true);
  assert.equal(finished.timeTaken, '05:00');
  assert.equal(finished.completed, true);
  assert.equal(finished.percent, 100);
  assert.equal(getInitialTimerSeconds(finished.timeTaken, 300, true), 0);
});

test('count-up keeps elapsed time when saving and resuming, including time beyond the goal', () => {
  assert.equal(getInitialTimerSeconds(undefined, 300, false), 0);
  assert.equal(getInitialTimerSeconds('02:00', 300, false), 120);
  assert.equal(getTimerProgress(120, 300, false).timeTaken, '02:00');
  assert.equal(getTimerProgress(120, 300, false).completed, false);
  const finished = getTimerProgress(360, 300, false);
  assert.equal(finished.timeTaken, '06:00');
  assert.equal(finished.completed, true);
  assert.equal(finished.percent, 100);
  assert.equal(getInitialTimerSeconds(finished.timeTaken, 300, false), 360);
});

test('switching timer direction preserves completed time', () => {
  const saved = getTimerProgress(180, 300, true).timeTaken;
  const countUp = getInitialTimerSeconds(saved, 300, false);
  assert.equal(countUp, 120);
  assert.equal(
    getInitialTimerSeconds(getTimerProgress(countUp, 300, false).timeTaken, 300, true),
    180,
  );
});

test('second precision and hour-long goals survive countdown save and resume', () => {
  const progress = getTimerProgress(3599, 7200, true);
  assert.equal(progress.timeTaken, '01:00:01');
  assert.equal(getInitialTimerSeconds(progress.timeTaken, 7200, true), 3599);
  assert.equal(getInitialTimerSeconds('06:00', 300, true), 0);
});
