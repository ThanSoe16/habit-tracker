'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const QueryIdentity = createContext<string | null>(null);
export function useQueryIdentity() {
  return useContext(QueryIdentity);
}

/** AuthGuard keys this boundary by identity, including its forms and query client. */
export function ReactQueryProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 300_000, refetchOnWindowFocus: false, retry: false },
          mutations: { retry: false },
        },
      }),
  );
  useEffect(
    () => () => {
      void queryClient.cancelQueries();
      queryClient.clear();
    },
    [queryClient],
  );
  return (
    <QueryIdentity.Provider value={userId}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </QueryIdentity.Provider>
  );
}
