import { DataRequestError, requireResult } from './request';

export const LIST_PAGE_SIZE = 10;
export type ListPage<T> = { rows: T[]; total: number; nextPage: number | undefined };

export function pageRange(page: number): [number, number] {
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) {
    throw new DataRequestError('The requested page is invalid.');
  }
  const from = (page - 1) * LIST_PAGE_SIZE;
  return [from, from + LIST_PAGE_SIZE - 1];
}

export function listPage<T>(
  result: { data: T[] | null; error: { code?: string } | null; count: number | null },
  page: number,
): ListPage<T> {
  const [from] = pageRange(page);
  const rows = requireResult(result, 'Could not load this list. Please try again.');
  if (
    result.count === null ||
    !Number.isSafeInteger(result.count) ||
    result.count < 0 ||
    rows.length !== Math.min(LIST_PAGE_SIZE, Math.max(0, result.count - from))
  ) {
    throw new DataRequestError('The list was incomplete. Please refresh.');
  }
  return {
    rows,
    total: result.count,
    nextPage: from + rows.length < result.count ? page + 1 : undefined,
  };
}
