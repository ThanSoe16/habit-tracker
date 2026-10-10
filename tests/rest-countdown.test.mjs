import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createRestCountdown,
  restCountdownReducer as reduce,
} from '../src/features/gym/utils/rest-countdown.ts';

test('manual rest waits for Start; exercise rest starts immediately', () => {
  const ready = createRestCountdown(60, 1000, false);
  assert.equal(reduce(ready, { type: 'tick', now: 20_000 }).remaining, 60);
  assert.equal(reduce(ready, { type: 'start', now: 20_000 }).deadline, 80_000);
  assert.equal(createRestCountdown(60, 1000, true).deadline, 61_000);
});

test('rest catches up after delayed/background ticks and stops at zero', () => {
  const running = createRestCountdown(60, 1000, true);
  assert.equal(reduce(running, { type: 'tick', now: 46_000 }).remaining, 15);
  const done = reduce(running, { type: 'tick', now: 90_000 });
  assert.equal(done.remaining, 0);
  assert.equal(done.deadline, null);
});

test('pause holds the remaining duration until resumed', () => {
  const paused = reduce(createRestCountdown(60, 0, true), { type: 'pause', now: 20_000 });
  assert.equal(paused.remaining, 40);
  assert.equal(reduce(paused, { type: 'tick', now: 90_000 }).remaining, 40);
  const resumed = reduce(paused, { type: 'start', now: 100_000 });
  assert.equal(reduce(resumed, { type: 'tick', now: 110_000 }).remaining, 30);
});

test('adding time extends both running and paused rest', () => {
  const running = reduce(createRestCountdown(60, 0, true), { type: 'add', now: 20_000 });
  assert.equal(running.remaining, 70);
  assert.equal(running.duration, 90);
  assert.equal(running.deadline, 90_000);
  const paused = reduce(createRestCountdown(60, 0, false), { type: 'add', now: 20_000 });
  assert.equal(paused.remaining, 90);
  assert.equal(paused.deadline, null);
});

test('finished rest cannot restart and accidentally complete a second set', () => {
  const done = reduce(createRestCountdown(60, 0, true), { type: 'tick', now: 60_000 });
  for (const type of ['start', 'pause', 'add', 'tick']) {
    assert.deepEqual(reduce(done, { type, now: 61_000 }), done);
  }
});
