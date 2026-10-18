import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { Habit } from '../types';
import type { ListPage } from '@/lib/supabase/pagination';

/** Apply a confirmed/optimistic row to existing views without manufacturing pages. */
export function replaceCachedHabit(
  client: QueryClient,
  userId: string,
  habit: Habit | null,
  id: string,
) {
  for (const [key, data] of client.getQueriesData({ queryKey: ['habits', userId] })) {
    const replace = (rows: Habit[]) =>
      rows.flatMap((row) => (row.id === id ? (habit ? [habit] : []) : [row]));
    if (key[2] === 'detail' && key[3] === id) client.setQueryData(key, habit);
    if (['summary', 'report', 'list'].includes(String(key[2])) && Array.isArray(data))
      client.setQueryData(key, replace(data));
    if (key[2] === 'infinite' && data) {
      const pages = data as InfiniteData<ListPage<Habit>>;
      client.setQueryData(key, {
        ...pages,
        pages: pages.pages.map((page) => ({ ...page, rows: replace(page.rows) })),
      });
    }
  }
}
