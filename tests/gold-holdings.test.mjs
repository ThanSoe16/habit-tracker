import nodeTest, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useBudgetStore } from '../src/store/use-budget-store.ts';
import { partitionIdentityStores } from '../src/lib/supabase/identity-scope.ts';
import { goldFormSchema } from '../src/features/budget/types/gold-form.ts';

const holding = {
  id: 'gold-1',
  kyat: 3,
  pae: 0,
  yway: 0,
  buyPrice: 300,
  currency: 'MMK',
  purchaseDate: '2026-09-02',
  note: 'Original',
  status: 'holding',
};
const values = { ...holding, note: '' };

// Exercise store actions locally without scheduling background account writes.
function test(name, run) {
  nodeTest(name, () => partitionIdentityStores(run));
}

beforeEach(() =>
  partitionIdentityStores(() => {
    useBudgetStore.setState({
      goldHoldings: [holding],
      walletBalances: { USDT: 0, THB: 500, MMK: 100, SGD: 0 },
    });
  }),
);

test('editing a holding adjusts only the purchase difference and keeps its ID and status', () => {
  const original = structuredClone(useBudgetStore.getState().goldHoldings);
  useBudgetStore.getState().updateGoldHolding(holding.id, {
    ...values,
    kyat: 2,
    buyPrice: 350,
    purchaseDate: '2026-08-01',
    note: ' Corrected ',
  });
  const state = useBudgetStore.getState();
  assert.equal(state.walletBalances.MMK, 50);
  assert.deepEqual(state.goldHoldings[0], {
    ...holding,
    kyat: 2,
    buyPrice: 350,
    purchaseDate: '2026-08-01',
    note: 'Corrected',
    sellPrice: undefined,
    soldDate: undefined,
  });
  assert.deepEqual(original, [holding]);
  assert.deepEqual(holding, { ...values, note: 'Original' });
  state.updateGoldHolding(holding.id, { ...values, buyPrice: 200 });
  assert.equal(useBudgetStore.getState().walletBalances.MMK, 200);
});

test('saving unchanged prices is idempotent and clearing a note is supported', () => {
  useBudgetStore.getState().updateGoldHolding(holding.id, values);
  useBudgetStore.getState().updateGoldHolding(holding.id, values);
  assert.equal(useBudgetStore.getState().walletBalances.MMK, 100);
  assert.equal(useBudgetStore.getState().goldHoldings[0].note, undefined);
});

test('changing currency refunds the old purchase and charges the new wallet once', () => {
  useBudgetStore
    .getState()
    .updateGoldHolding(holding.id, { ...values, currency: 'THB', buyPrice: 400 });
  assert.deepEqual(useBudgetStore.getState().walletBalances, {
    USDT: 0,
    MMK: 400,
    THB: 100,
    SGD: 0,
  });
});

test('sold record edits reconcile both purchase and sale amounts without changing status', () => {
  const sold = { ...holding, status: 'sold', sellPrice: 200, soldDate: '2026-09-03' };
  useBudgetStore.setState({ goldHoldings: [sold] });
  useBudgetStore.getState().updateGoldHolding(holding.id, {
    ...sold,
    buyPrice: 320,
    sellPrice: 250,
    soldDate: '2026-09-04',
    note: '',
  });
  assert.equal(useBudgetStore.getState().walletBalances.MMK, 130);
  assert.equal(useBudgetStore.getState().goldHoldings[0].status, 'sold');
  assert.equal(useBudgetStore.getState().goldHoldings[0].sellPrice, 250);
  useBudgetStore.getState().updateGoldHolding(holding.id, {
    ...sold,
    currency: 'THB',
    buyPrice: 400,
    sellPrice: 300,
    note: '',
  });
  assert.deepEqual(useBudgetStore.getState().walletBalances, {
    USDT: 0,
    MMK: 200,
    THB: 400,
    SGD: 0,
  });
});

test('missing records, status conflicts and unaffordable edits leave all state unchanged', () => {
  for (const [id, input] of [
    ['missing', values],
    [holding.id, { ...values, buyPrice: 401 }],
    [holding.id, { ...values, currency: 'THB', buyPrice: 501 }],
    [holding.id, { ...values, status: 'sold', sellPrice: 300, soldDate: '2026-09-03' }],
  ]) {
    const before = useBudgetStore.getState();
    assert.throws(() => before.updateGoldHolding(id, input));
    assert.equal(useBudgetStore.getState(), before);
  }
});

test('spent sale proceeds cannot be removed by a currency change or a lower selling price', () => {
  const sold = { ...holding, status: 'sold', sellPrice: 600, soldDate: '2026-09-03', note: '' };
  useBudgetStore.setState({ goldHoldings: [sold] });
  const before = useBudgetStore.getState();
  for (const input of [
    { ...sold, currency: 'THB' },
    { ...sold, sellPrice: 100 },
  ]) {
    assert.throws(() => before.updateGoldHolding(holding.id, input), /Not enough MMK/);
    assert.equal(useBudgetStore.getState(), before);
  }
});

test('invalid weights, prices, dates and incomplete sale details fail before mutating state', () => {
  for (const override of [
    { kyat: 0 },
    { kyat: -1 },
    { kyat: 0.5 },
    { pae: 16 },
    { yway: 8 },
    { buyPrice: 0 },
    { buyPrice: Infinity },
    { buyPrice: NaN },
    { currency: 'invalid' },
    { purchaseDate: '2026-02-30' },
    { status: 'sold' },
    { status: 'sold', sellPrice: 200, soldDate: '2026-09-01' },
  ]) {
    const input = { ...values, ...override };
    assert.equal(goldFormSchema.safeParse(input).success, false);
    const before = useBudgetStore.getState();
    assert.throws(() => before.updateGoldHolding(holding.id, input));
    assert.equal(useBudgetStore.getState(), before);
  }
});
