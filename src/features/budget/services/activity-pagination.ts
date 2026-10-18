import { LIST_PAGE_SIZE } from '@/lib/supabase/pagination';

type ActivityGroup = 'income' | 'expenses' | 'exchange';
export type ActivityCursor = { page: number; totals?: Record<ActivityGroup, number> };
type PageResult = { ids: string[]; total: number };

/** Each source can run out at a different time. Never request a range beyond its count. */
export async function readActivityPage(
  cursor: ActivityCursor,
  read: (group: ActivityGroup, page: number) => Promise<PageResult>,
) {
  const ids: string[] = [];
  const totals = { income: 0, expenses: 0, exchange: 0 };
  for (const group of ['income', 'expenses', 'exchange'] as const) {
    const knownTotal = cursor.totals?.[group];
    if (knownTotal !== undefined && (cursor.page - 1) * LIST_PAGE_SIZE >= knownTotal) {
      totals[group] = knownTotal;
      continue;
    }
    const result = await read(group, cursor.page);
    ids.push(...result.ids);
    totals[group] = result.total;
  }
  const total = Object.values(totals).reduce((sum, count) => sum + count, 0);
  const nextPage: ActivityCursor | undefined =
    cursor.page * LIST_PAGE_SIZE < total ? { page: cursor.page + 1, totals } : undefined;
  return { ids, total, nextPage };
}
