import type { BudgetEntry, MonthlySalary } from './model';

export const DEFAULT_SALARIES: MonthlySalary[] = [
  {
    id: 'sal-1',
    title: 'Primary Salary',
    amount: 1000,
    currency: 'USDT',
    category: 'Salary',
    isEnabled: true,
    note: 'Fixed USDT Salary',
  },
  {
    id: 'sal-2',
    title: 'Local Freelance',
    amount: 8000,
    currency: 'THB',
    category: 'Side Business',
    isEnabled: true,
    note: 'Fixed THB retainer',
  },
];

export const DEFAULT_ENTRIES: BudgetEntry[] = [
  {
    id: 'entry-1',
    title: 'Supermarket Groceries',
    amount: 125.4,
    currency: 'USDT',
    type: 'expense',
    category: 'Food & Groceries',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'entry-2',
    title: 'Gym Membership',
    amount: 45.0,
    currency: 'USDT',
    type: 'expense',
    category: 'Health & Fitness',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'entry-3',
    title: 'Dinner & Drinks',
    amount: 850.0,
    currency: 'THB',
    type: 'expense',
    category: 'Food & Groceries',
    date: new Date().toISOString().split('T')[0],
  },
];
