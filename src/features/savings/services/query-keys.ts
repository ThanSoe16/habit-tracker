export const savingsKeys = {
  scope: (userId: string | null) => ['savings', userId] as const,
  balances: (userId: string | null) => ['savings', userId, 'balances'] as const,
  lists: (userId: string | null) => ['savings', userId, 'list'] as const,
  list: (userId: string | null, page: number) => ['savings', userId, 'list', page] as const,
  detail: (userId: string | null, id: string) => ['savings', userId, 'detail', id] as const,
  history: (userId: string | null, id: string, page: number) =>
    ['savings', userId, 'history', id, page] as const,
};
