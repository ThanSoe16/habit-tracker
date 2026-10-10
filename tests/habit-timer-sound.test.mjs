import assert from 'node:assert/strict';
import test from 'node:test';
import { createTimerSound } from '../src/features/habits/utils/timer-sound.ts';
import { useUserStore } from '../src/store/use-user-store.ts';

function setupAudio(t, ringtone = 'chime') {
  const original = useUserStore.getState();
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalAudio = Object.getOwnPropertyDescriptor(globalThis, 'Audio');
  const contexts = [];
  const media = [];
  class AudioContext {
    state = 'suspended';
    currentTime = 0;
    destination = {};
    starts = 0;
    resumes = 0;
    closes = 0;
    constructor() {
      contexts.push(this);
    }
    async resume() {
      this.resumes++;
      this.state = 'running';
    }
    async close() {
      this.closes++;
      this.state = 'closed';
    }
    createOscillator() {
      return {
        frequency: { value: 0 },
        connect() {},
        stop() {},
        start: () => {
          this.starts++;
        },
      };
    }
    createGain() {
      return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } };
    }
  }
  class Audio {
    muted = false;
    currentTime = 0;
    plays = [];
    pauses = 0;
    constructor(src) {
      this.src = src;
      media.push(this);
    }
    async play() {
      this.plays.push(this.muted);
    }
    pause() {
      this.pauses++;
    }
  }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext } });
  Object.defineProperty(globalThis, 'Audio', { configurable: true, value: Audio });
  useUserStore.setState({ ringtone, customRingtoneUrl: '/custom.mp3', vibrationEnabled: false });
  t.after(() => {
    useUserStore.setState(original, true);
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else delete globalThis.window;
    if (originalAudio) Object.defineProperty(globalThis, 'Audio', originalAudio);
    else delete globalThis.Audio;
  });
  return { contexts, media };
}

test('Start prepares audio silently and completion reuses the unlocked context', (t) => {
  const { contexts } = setupAudio(t);
  const sound = createTimerSound();
  sound.prepare();
  assert.equal(contexts.length, 1);
  assert.equal(contexts[0].resumes, 1);
  assert.equal(contexts[0].starts, 0);
  sound.prepare(); // Resume uses the same context.
  sound.play();
  assert.equal(contexts.length, 1);
  assert.equal(contexts[0].starts, 3);
  sound.dispose();
  assert.equal(contexts[0].closes, 1);
  sound.play();
  sound.prepare();
  assert.equal(contexts[0].starts, 3);
  assert.equal(contexts.length, 1);
});

test('completion respects the selected built-in ringtone', (t) => {
  const { contexts } = setupAudio(t, 'marimba');
  const sound = createTimerSound();
  sound.prepare();
  sound.play();
  assert.equal(contexts[0].starts, 4);
  sound.dispose();
});

test('custom ringtone is primed silently, then played audibly with the same element', async (t) => {
  const { media, contexts } = setupAudio(t, 'custom');
  const sound = createTimerSound();
  sound.prepare();
  await Promise.resolve();
  assert.equal(media.length, 1);
  assert.deepEqual(media[0].plays, [true]);
  assert.equal(media[0].pauses, 1);
  sound.play();
  assert.deepEqual(media[0].plays, [true, false]);
  assert.equal(contexts[0].starts, 0);
  sound.dispose();
  assert.equal(media[0].pauses, 2);
});

test('late custom-audio preparation cannot interrupt the completion sound', async (t) => {
  const { media } = setupAudio(t, 'custom');
  const sound = createTimerSound();
  sound.prepare();
  sound.play();
  await Promise.resolve();
  assert.equal(media[0].pauses, 0);
  assert.deepEqual(media[0].plays, [true, false]);
  sound.dispose();
});

test('reset can prepare a new sound while the disposed sound stays silent', (t) => {
  const { contexts } = setupAudio(t);
  const previous = createTimerSound();
  previous.prepare();
  previous.dispose();
  const restarted = createTimerSound();
  restarted.prepare();
  previous.play();
  restarted.play();
  assert.equal(contexts[0].starts, 0);
  assert.equal(contexts[1].starts, 3);
  restarted.dispose();
});
