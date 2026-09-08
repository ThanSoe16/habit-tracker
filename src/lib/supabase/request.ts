import { z } from 'zod';

export const textIdSchema = z.string().trim().min(1).max(256);

/** Safe public message with a diagnostic code, never backend row contents. */
export class DataRequestError extends Error {
  readonly code: string;

  constructor(message: string, error?: { code?: string } | null) {
    super(message);
    this.name = 'DataRequestError';
    this.code = error?.code ?? 'INVALID_RESULT';
  }
}

export function requireResult<T>(
  result: { data: T | null; error: { code?: string } | null },
  message = 'Could not complete the request. Please try again.',
): T {
  if (result.error || result.data === null) throw new DataRequestError(message, result.error);
  return result.data;
}

type ListResult<T> = {
  data: T[] | null;
  error: { code?: string } | null;
  count: number | null;
};

/**
 * Complete report/sync reads with bounded requests. Callers select explicit columns,
 * request an exact count, and order by a unique key before passing the builder.
 * A changed count or an incomplete page rejects the entire snapshot.
 * This is not a transactional snapshot across concurrent database updates.
 */
export async function readCompleteList<T>(query: {
  range: (from: number, to: number) => PromiseLike<ListResult<T>>;
}): Promise<{ data: T[]; error: null }> {
  const rows: T[] = [];
  let total: number | undefined;
  do {
    const result = await query.range(rows.length, rows.length + 499);
    const page = requireResult(result, 'Could not load complete data. Please try again.');
    if (
      result.count === null ||
      !Number.isSafeInteger(result.count) ||
      result.count < 0 ||
      (total !== undefined && result.count !== total) ||
      (page.length === 0 && rows.length < result.count) ||
      rows.length + page.length > result.count
    ) {
      throw new DataRequestError('The data changed or was incomplete. Please refresh.');
    }
    total = result.count;
    rows.push(...page);
  } while (rows.length < total);
  return { data: rows, error: null };
}
