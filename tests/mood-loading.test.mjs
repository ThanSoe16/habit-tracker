import assert from 'node:assert/strict';
import test from 'node:test';
import { supabase } from '../src/lib/supabase/client.ts';
import { moodService } from '../src/features/mood/services/supabase.ts';
import { useMoodStore } from '../src/store/use-mood-store.ts';

const entry = { mood: 'Good', label: 'Good', emoji: '😊', timestamp: '2026-09-01T12:00:00Z' };

function mockMoods(t, respond) {
  const calls = [];
  t.mock.method(supabase, 'from', (table) => {
    assert.equal(table, 'mood_entries');
    const call = { operation: 'read' };
    calls.push(call);
    const query = {
      select(columns, options) {
        Object.assign(call, { columns, options });
        return query;
      },
      order(column) {
        call.order = column;
        return query;
      },
      range(from, to) {
        call.range = [from, to];
        return query;
      },
      upsert(payload) {
        Object.assign(call, { operation: 'upsert', payload });
        return query;
      },
      single() {
        call.single = true;
        return query;
      },
      then(resolve, reject) {
        return Promise.resolve()
          .then(() => respond(call))
          .then(resolve, reject);
      },
    };
    return query;
  });
  return calls;
}

const missingNote = { data: null, error: { code: '42703' }, count: null };
const hasNote = { data: [], error: null };

test('legacy schema loads every mood record without the optional note column', async (t) => {
  const rows = Array.from({ length: 17 }, (_, index) => ({
    ...entry,
    date_key: `2026-09-${String(index + 1).padStart(2, '0')}`,
    tag: null,
  }));
  const calls = mockMoods(t, (call) =>
    call.columns === 'note' ? missingNote : { data: rows, error: null, count: rows.length },
  );
  const history = await moodService.fetchMoods();
  assert.equal(Object.keys(history).length, 17);
  assert.equal(history['2026-09-17'].emoji, entry.emoji);
  assert.equal(history['2026-09-01'].note, undefined);
  assert.equal(calls[1].columns.includes('note'), false);
  assert.equal(calls[1].options.count, 'exact');
  assert.equal(calls[1].order, 'date_key');
});

test('migrated schemas retain saved reflection notes', async (t) => {
  mockMoods(t, (call) =>
    call.columns === 'note'
      ? hasNote
      : {
          data: [{ ...entry, date_key: '2026-09-01', note: 'A good walk.' }],
          error: null,
          count: 1,
        },
  );
  assert.equal((await moodService.fetchMoods())['2026-09-01'].note, 'A good walk.');
});

test('network and permission errors are not treated as an older schema', async (t) => {
  const calls = mockMoods(t, () => ({
    data: null,
    error: { code: '42501', message: 'private detail' },
  }));
  await assert.rejects(moodService.fetchMoods(), (error) => {
    assert.equal(error.code, '42501');
    assert.doesNotMatch(error.message, /private detail/);
    return true;
  });
  assert.equal(calls.length, 1);
});

test('failed or incomplete reads after schema detection still reject', async (t) => {
  let result = { data: null, error: { code: 'OFFLINE' }, count: null };
  mockMoods(t, (call) => (call.columns === 'note' ? missingNote : result));
  await assert.rejects(moodService.fetchMoods(), { code: 'OFFLINE' });
  result = { data: [], error: null, count: 17 };
  await assert.rejects(moodService.fetchMoods(), /incomplete/);
});

test('saving a mood without a reflection works on the legacy schema', async (t) => {
  const calls = mockMoods(t, (call) =>
    call.columns === 'note'
      ? missingNote
      : {
          data: call.payload,
          error: null,
        },
  );
  const saved = await moodService.upsertMood('2026-09-01', { ...entry, note: '' });
  assert.equal(saved.mood, 'Good');
  assert.equal(saved.note, undefined);
  assert.equal('note' in calls[1].payload, false);
  assert.equal(calls[1].columns.includes('note'), false);
  assert.equal(calls[1].single, true);
});

test('a reflection is never silently discarded when the legacy schema cannot save it', async (t) => {
  const calls = mockMoods(t, () => missingNote);
  await assert.rejects(
    moodService.upsertMood('2026-09-01', { ...entry, note: 'Keep this note.' }),
    /has not been saved/,
  );
  assert.equal(
    calls.some((call) => call.operation === 'upsert'),
    false,
  );
});

test('modern writes retain the reflection and invalid dates send no requests', async (t) => {
  const calls = mockMoods(t, (call) =>
    call.columns === 'note' ? hasNote : { data: call.payload, error: null },
  );
  await assert.rejects(moodService.upsertMood('invalid', entry));
  assert.equal(calls.length, 0);
  const saved = await moodService.upsertMood('2026-09-01', { ...entry, note: 'Keep this note.' });
  assert.equal(saved.note, 'Keep this note.');
  assert.equal(calls[1].payload.note, 'Keep this note.');
});

test('initial load failure exposes an error and retry loads the history', async (t) => {
  const original = useMoodStore.getState();
  t.after(() => useMoodStore.setState(original, true));
  t.mock.method(console, 'warn', () => {});
  useMoodStore.setState({ history: {}, isLoaded: false, isLoading: false, error: null });
  let fail = true;
  t.mock.method(moodService, 'fetchMoods', async () => {
    assert.equal(useMoodStore.getState().isLoading, true);
    if (fail) throw new Error('private detail');
    return { '2026-09-01': entry };
  });
  await useMoodStore.getState().fetchFromSupabase();
  assert.equal(useMoodStore.getState().isLoaded, false);
  assert.equal(useMoodStore.getState().isLoading, false);
  assert.match(useMoodStore.getState().error, /Could not load/);
  assert.doesNotMatch(useMoodStore.getState().error, /private detail/);
  fail = false;
  await useMoodStore.getState().fetchFromSupabase();
  assert.equal(useMoodStore.getState().isLoaded, true);
  assert.equal(useMoodStore.getState().error, null);
  assert.deepEqual(useMoodStore.getState().history, { '2026-09-01': entry });
});

test('background refresh failure keeps previously loaded mood history', async (t) => {
  const original = useMoodStore.getState();
  t.after(() => useMoodStore.setState(original, true));
  t.mock.method(console, 'warn', () => {});
  const history = { '2026-09-01': entry };
  useMoodStore.setState({ history, isLoaded: true, isLoading: false, error: null });
  t.mock.method(moodService, 'fetchMoods', async () => {
    throw new Error('Offline');
  });
  await useMoodStore.getState().fetchFromSupabase();
  assert.equal(useMoodStore.getState().history, history);
  assert.equal(useMoodStore.getState().isLoaded, true);
  assert.equal(useMoodStore.getState().isLoading, false);
  assert.ok(useMoodStore.getState().error);
});
