import type { BudgetFilterParams } from '../types';

export const budgetKeys = {
  scope: (userId: string | null) => ['budget', userId] as const,
  lists: (userId: string | null) => ['budget', userId, 'list'] as const,
  list: (userId: string | null, params?: BudgetFilterParams) =>
    ['budget', userId, 'list', params ?? {}] as const,
  detail: (userId: string | null, id: string) => ['budget', userId, 'detail', id] as const,
};
