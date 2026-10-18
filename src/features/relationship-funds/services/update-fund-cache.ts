import type { QueryClient, InfiniteData } from '@tanstack/react-query';
import type { ListPage } from '@/lib/supabase/pagination';
import type { FundTransaction } from '../types';
import { fundKeys } from './query-keys';

export async function updateFundCache(
  client: QueryClient,
  userId: string,
  row: FundTransaction,
  deleted = false,
) {
  await client.cancelQueries({ queryKey: fundKeys.scope(userId) });
  client.setQueryData(fundKeys.detail(userId, row.id), deleted ? null : row);
  // Replace persisted rows immediately, even if the following refresh fails.
  for (const [key, rows] of client.getQueriesData<FundTransaction[]>({
    queryKey: fundKeys.scope(userId),
  })) {
    if (key[2] !== 'month' || !rows) continue;
    const next = rows.filter((expense) => expense.id !== row.id);
    if (
      !deleted &&
      (key[3] === null || key[3] === row.date.slice(0, 7)) &&
      (key[4] === 'ALL' || key[4] === row.person)
    )
      next.push(row);
    next.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
    client.setQueryData(key, next);
  }
  client.setQueriesData<InfiniteData<ListPage<FundTransaction>>>(
    { queryKey: [...fundKeys.scope(userId), 'infinite'] },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          rows: page.rows.flatMap((existing) =>
            existing.id === row.id ? (deleted ? [] : [row]) : [existing],
          ),
        })),
      },
  );
  await client.invalidateQueries({ queryKey: fundKeys.scope(userId) });
}
