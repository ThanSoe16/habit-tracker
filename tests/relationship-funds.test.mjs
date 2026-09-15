import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import {
  fundTransactionInputSchema,
  getFundMonthBounds,
  getFundSummary,
} from '../src/features/relationship-funds/types/index.ts';
import { createRelationshipFundService } from '../src/features/relationship-funds/services/relationship-fund-service.ts';
import { fundKeys } from '../src/features/relationship-funds/services/query-keys.ts';
import { updateFundCache } from '../src/features/relationship-funds/services/update-fund-cache.ts';

const userId = '11111111-1111-4111-8111-111111111111';
const id = '22222222-2222-4222-8222-222222222222';
const input = {
  title: 'Dinner',
  amount: 50000,
  date: '2026-09-15',
  note: '',
  kind: 'spend',
  person: 'TSO',
  money_source: 'current_budget',
};
const row = { ...input, id, user_id: userId, created_at: '2026-09-15T12:00:00Z' };

test('fund balance comes only from flexible savings and spending, with named contributions', () => {
  assert.deepEqual(getFundSummary([]), { saved: 0, spent: 0, remaining: 0, TSO: 0, Nway: 0 });
  assert.deepEqual(
    getFundSummary([
      row,
      { ...row, kind: 'save', person: 'TSO', amount: 120000 },
      { ...row, kind: 'save', person: 'Nway', amount: 230000 },
    ]),
    {
      saved: 350000,
      spent: 50000,
      remaining: 300000,
      TSO: 120000,
      Nway: 230000,
    },
  );
  assert.equal(getFundSummary([row]).remaining, -50000);
  assert.deepEqual(getFundMonthBounds('2028-02'), { start: '2028-02-01', end: '2028-02-29' });
  assert.equal(getFundMonthBounds('2026-02').end, '2026-02-28');
  assert.equal(getFundMonthBounds('2026-12').end, '2026-12-31');
  for (const month of ['2026-13', '2026-00', 'bad', '1899-12'])
    assert.throws(() => getFundMonthBounds(month));
});

test('form-bypassing payloads reject invalid amounts, dates and labels', () => {
  for (const amount of [0, -1, 0.1, Infinity, NaN, 1000000000001])
    assert.equal(fundTransactionInputSchema.safeParse({ ...input, amount }).success, false);
  for (const date of ['2026-02-30', '1899-12-31', '', '2026-09'])
    assert.equal(fundTransactionInputSchema.safeParse({ ...input, date }).success, false);
  assert.equal(fundTransactionInputSchema.safeParse({ ...input, title: ' ' }).success, false);
  for (const overrides of [
    { person: null },
    { person: 'Other' },
    { kind: 'income' },
    { money_source: 'unknown' },
  ])
    assert.equal(fundTransactionInputSchema.safeParse({ ...input, ...overrides }).success, false);
  for (const person of ['TSO', 'Nway'])
    for (const kind of ['save', 'spend'])
      for (const money_source of ['current_budget', 'extra'])
        assert.equal(
          fundTransactionInputSchema.safeParse({ ...input, person, kind, money_source }).success,
          true,
        );
});

test('complete monthly reads include more than 500 transactions and validate scope and bounds', async () => {
  const rows = Array.from({ length: 503 }, (_, index) => ({
    ...row,
    id: `aaaaaaaa-aaaa-4aaa-8aaa-${String(index).padStart(12, '0')}`,
  }));
  const calls = [];
  let incomplete = false;
  const builder = {
    select(...args) {
      calls.push(['select', ...args]);
      return builder;
    },
    eq(...args) {
      calls.push(['eq', ...args]);
      return builder;
    },
    gte(...args) {
      calls.push(['gte', ...args]);
      return builder;
    },
    lte(...args) {
      calls.push(['lte', ...args]);
      return builder;
    },
    order(...args) {
      calls.push(['order', ...args]);
      return builder;
    },
    range(from, to) {
      return Promise.resolve({
        data: incomplete ? [] : rows.slice(from, to + 1),
        error: null,
        count: rows.length,
      });
    },
  };
  const service = createRelationshipFundService(async () => ({
    userId,
    supabase: { from: () => builder },
  }));
  assert.equal((await service.month(userId, '2026-09')).length, 503);
  assert.ok(calls.some((call) => call.join() === ['eq', 'user_id', userId].join()));
  assert.ok(calls.some((call) => call.join() === 'gte,date,2026-09-01'));
  assert.ok(calls.some((call) => call.join() === 'lte,date,2026-09-30'));
  assert.deepEqual(
    calls.filter((call) => call[0] === 'order').map((call) => call[1]),
    ['date', 'id'],
  );
  calls.length = 0;
  assert.equal((await service.month(userId, null)).length, 503);
  assert.equal(
    calls.some((call) => call[0] === 'gte' || call[0] === 'lte'),
    false,
  );
  incomplete = true;
  await assert.rejects(service.month(userId, '2026-09'), /incomplete/);
});

function mockService(handler) {
  const requests = [];
  const supabase = createClient('https://example.supabase.co', 'test', {
    global: {
      fetch: async (url, init) => {
        requests.push({ url: new URL(url), init, body: init.body ? JSON.parse(init.body) : null });
        return handler(requests.at(-1), requests.length);
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { service: createRelationshipFundService(async () => ({ userId, supabase })), requests };
}
const response = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

test('writes return persisted rows, exclude protected fields and reject zero-row operations', async () => {
  const { service, requests } = mockService(() => response(row));
  assert.deepEqual(await service.save(userId, id, { ...input, user_id: id }, 'create'), row);
  assert.deepEqual(requests[0].body, { id, ...input });
  await service.save(userId, id, input, 'edit');
  assert.deepEqual(requests[1].body, input);
  assert.equal(requests[1].url.searchParams.get('user_id'), `eq.${userId}`);
  const failed = mockService(() =>
    response({ code: 'PGRST116', message: 'sensitive database detail' }, 406),
  );
  await assert.rejects(
    failed.service.remove(userId, id),
    (error) => error.code === 'PGRST116' && !error.message.includes('sensitive'),
  );
  await assert.rejects(failed.service.save(userId, id, input, 'edit'), /Could not save/);
});

test('invalid inputs and a replaced account do not send requests', async () => {
  const { service, requests } = mockService(() => response(row));
  await assert.rejects(service.save(userId, id, { ...input, amount: -1 }, 'create'));
  await assert.rejects(service.month(userId, '2026-13'));
  await assert.rejects(service.remove(id, id), /session changed/);
  assert.equal(requests.length, 0);
});

test('retrying a committed create reuses its ID and never silently accepts changed details', async () => {
  const duplicate = () => response({ code: '23505' }, 409);
  const { service } = mockService((request) =>
    request.init.method === 'POST' ? duplicate() : response(row),
  );
  assert.deepEqual(await service.save(userId, id, input, 'create'), row);
  await assert.rejects(
    service.save(userId, id, { ...input, amount: 60000 }, 'create'),
    /different details/,
  );
});

test('saved edits move between month caches; deletion refunds once and never changes another account', async () => {
  const client = new QueryClient();
  const september = fundKeys.month(userId, '2026-09');
  const october = fundKeys.month(userId, '2026-10');
  const other = fundKeys.month(id, '2026-09');
  const all = fundKeys.month(userId, null);
  client.setQueryData(all, [row]);
  client.setQueryData(september, [row]);
  client.setQueryData(october, []);
  client.setQueryData(other, [row]);
  const saved = {
    ...row,
    amount: 100000,
    date: '2026-10-01',
    kind: 'save',
    person: 'Nway',
    money_source: 'extra',
  };
  await updateFundCache(client, userId, saved);
  await updateFundCache(client, userId, saved);
  assert.equal(getFundSummary(client.getQueryData(september)).remaining, 0);
  assert.equal(getFundSummary(client.getQueryData(october)).remaining, 100000);
  assert.equal(getFundSummary(client.getQueryData(other)).remaining, -50000);
  assert.equal(getFundSummary(client.getQueryData(all)).remaining, 100000);
  assert.equal(getFundSummary(client.getQueryData(all)).Nway, 100000);
  await updateFundCache(client, userId, saved, true);
  assert.equal(getFundSummary(client.getQueryData(october)).remaining, 0);
  assert.equal(client.getQueryData(fundKeys.detail(userId, id)), null);
  assert.equal(getFundSummary(client.getQueryData(all)).remaining, 0);
  client.clear();
});

test('person filters scope service requests and invalid people fail before reading', async () => {
  const { service, requests } = mockService(() => response([]));
  // The request can fail count validation; its filters still use the actual client.
  await assert.rejects(service.month(userId, null, undefined, 'Nway'));
  assert.equal(requests[0].url.searchParams.get('person'), 'eq.Nway');
  const count = requests.length;
  await assert.rejects(service.month(userId, null, undefined, 'Unknown'));
  assert.equal(requests.length, count);
  assert.notDeepEqual(fundKeys.month(userId, null, 'TSO'), fundKeys.month(userId, null, 'Nway'));
});

test('editing the person moves the row between person filters and updates the combined total', async () => {
  const client = new QueryClient();
  const tso = fundKeys.month(userId, null, 'TSO');
  const nway = fundKeys.month(userId, null, 'Nway');
  const all = fundKeys.month(userId, null);
  client.setQueryData(tso, [row]);
  client.setQueryData(nway, []);
  client.setQueryData(all, [row]);
  const saved = { ...row, person: 'Nway', amount: 12345 };
  await updateFundCache(client, userId, saved);
  assert.deepEqual(client.getQueryData(tso), []);
  assert.deepEqual(client.getQueryData(nway), [saved]);
  assert.deepEqual(client.getQueryData(all), [saved]);
  await updateFundCache(client, userId, saved, true);
  assert.deepEqual(client.getQueryData(nway), []);
  assert.deepEqual(client.getQueryData(all), []);
  client.clear();
});
