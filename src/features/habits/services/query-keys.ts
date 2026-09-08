import type { HabitFilterParams } from '../types';

export const habitKeys = {
  scope: (userId: string | null) => ['habits', userId] as const,
  lists: (userId: string | null) => ['habits', userId, 'list'] as const,
  list: (userId: string | null, params?: HabitFilterParams) =>
    ['habits', userId, 'list', params ?? {}] as const,
  detail: (userId: string | null, id: string) => ['habits', userId, 'detail', id] as const,
};
