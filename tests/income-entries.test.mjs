import test from 'node:test';
import assert from 'node:assert/strict';
import { getIncomeEntries } from '../src/features/budget/utils/income-entries.ts';

test('Income shows salary payouts and manually created income, excluding savings and family transfers', () => {
  const manual = {
    id: 'manual',
    title: 'Freelance Gig',
    type: 'income',
    category: 'Side Business',
    amount: 3000,
    currency: 'THB',
    date: '2026-09-01',
  };
  const salary = {
    ...manual,
    id: 'salary',
    title: '1st Month Credit: Company',
    category: 'Salary',
    currency: 'SGD',
    date: '2026-08-31',
  };
  const entries = [
    salary,
    {
      ...manual,
      id: 'savings-11111111-1111-4111-8111-111111111111',
      category: 'Savings',
      date: '2026-09-18',
    },
    { ...manual, id: 'savings-renamed', title: 'Edited title', category: 'Salary' },
    { ...manual, id: 'family', category: 'Family' },
    { ...manual, id: 'expense', type: 'expense' },
    { ...manual, id: 'exchange', type: 'exchange' },
    manual,
  ];
  const original = structuredClone(entries);
  assert.deepEqual(getIncomeEntries(entries), [manual, salary]);
  assert.deepEqual(getIncomeEntries(entries, 'THB'), [manual]);
  assert.deepEqual(getIncomeEntries(entries, 'SGD'), [salary]);
  assert.deepEqual(getIncomeEntries(entries, 'MMK'), []);
  assert.deepEqual(entries, original);
});

test('manually logged income is not hidden just because its title or category mentions savings', () => {
  const manual = {
    id: 'manual',
    title: 'Withdrawal from savings',
    type: 'income',
    category: 'Savings',
    amount: 10,
    currency: 'MMK',
    date: '2026-09-18',
  };
  assert.deepEqual(getIncomeEntries([manual]), [manual]);
});
