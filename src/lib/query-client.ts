import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 300_000, gcTime: 1_800_000, refetchOnWindowFocus: false, retry: false },
      mutations: { retry: false },
    },
  });
}
