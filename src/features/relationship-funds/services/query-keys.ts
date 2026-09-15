export const fundKeys = {
  scope: (userId: string | null) => ['relationship-funds', userId] as const,
  month: (userId: string | null, month: string | null, person: 'ALL' | 'TSO' | 'Nway' = 'ALL') =>
    ['relationship-funds', userId, 'month', month, person] as const,
  detail: (userId: string, id: string) => ['relationship-funds', userId, 'detail', id] as const,
};
