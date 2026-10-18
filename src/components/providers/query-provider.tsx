'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query-client';
import { QueryLoadingIndicator } from './query-loading-indicator';

const QueryIdentity = createContext<string | null>(null);
export function useQueryIdentity() {
  return useContext(QueryIdentity);
}

/** The account boundary keys this client by identity and survives route changes. */
export function ReactQueryProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(createQueryClient);
  useEffect(
    () => () => {
      void queryClient.cancelQueries();
      queryClient.clear();
    },
    [queryClient],
  );
  return (
    <QueryIdentity.Provider value={userId}>
      <QueryClientProvider client={queryClient}>
        <QueryLoadingIndicator />
        {children}
      </QueryClientProvider>
    </QueryIdentity.Provider>
  );
}
