import type { QueryClient, InfiniteData } from '@tanstack/react-query';
import type { SavingsBalance, SavingsGoal } from '../types';
import { savingsKeys } from './query-keys';

/** Show the committed balance even if the subsequent list refresh fails. */
export async function updateSavingsCache(client: QueryClient, userId: string, goal: SavingsGoal) {
  await client.cancelQueries({ queryKey: savingsKeys.scope(userId) });
  await client.cancelQueries({ queryKey: savingsKeys.balances(userId) });
  client.setQueryData<SavingsBalance[]>(
    savingsKeys.balances(userId),
    (rows) =>
      rows && [
        ...rows.filter((row) => row.id !== goal.id),
        {
          id: goal.id,
          currency: goal.currency,
          balance: goal.balance,
        },
      ],
  );
  client.setQueryData(savingsKeys.detail(userId, goal.id), goal);
  client.setQueriesData<{ rows: SavingsGoal[]; total: number }>(
    { queryKey: savingsKeys.lists(userId) },
    (page) =>
      page && {
        ...page,
        rows: page.rows.map((row) => (row.id === goal.id ? goal : row)),
      },
  );
  client.setQueriesData<InfiniteData<{ rows: SavingsGoal[]; total: number }>>(
    { queryKey: ['savings', userId, 'infinite'] },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          rows: page.rows.map((row) => (row.id === goal.id ? goal : row)),
        })),
      },
  );
  await client.invalidateQueries({ queryKey: savingsKeys.scope(userId) });
}
