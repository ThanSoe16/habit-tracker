# Example 3: Queries and Mutations

The application must already have a QueryClient provider and an approved typed browser client factory. `createClient()` below must return `SupabaseClient<Database>` using the current user's session and a publishable/anon key. Do not substitute an administrative client.

## `features/employees/services/query-keys.ts`

```ts
import type { EmployeeListParams, EmployeeScope } from '../types';

export const employeeKeys = {
  scope: (scope: EmployeeScope) =>
    ['employees', scope.userId, scope.tenantId] as const,
  lists: (scope: EmployeeScope) =>
    [...employeeKeys.scope(scope), 'list'] as const,
  list: (scope: EmployeeScope, params: EmployeeListParams) =>
    [...employeeKeys.lists(scope), params] as const,
  detail: (scope: EmployeeScope, id: string) =>
    [...employeeKeys.scope(scope), 'detail', id] as const,
};
```

## `features/employees/services/queries.ts`

```ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { createEmployeeService } from './api';
import { employeeKeys } from './query-keys';
import type { EmployeeListParams, EmployeeScope } from '../types';

export function useEmployees(scope: EmployeeScope, params: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(scope, params),
    queryFn: () => createEmployeeService(createClient()).list(scope.tenantId, params),
    enabled: Boolean(scope.userId && scope.tenantId),
    retry: false,
  });
}

export function useEmployee(scope: EmployeeScope, id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(scope, id),
    queryFn: () => createEmployeeService(createClient()).get(scope.tenantId, id),
    enabled: Boolean(scope.userId && scope.tenantId && id),
    retry: false,
  });
}
```

Manual retry is used here to keep failure behavior explicit. Integrate the repository's selective retry/cancellation policy when adopting the example. Do not mount the edit panel with an empty ID: a disabled query can otherwise remain pending without ever fetching.

## `features/employees/services/mutations.ts`

```ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { createEmployeeService } from './api';
import { employeeKeys } from './query-keys';
import type { EmployeeScope, EmployeeValues } from '../types';

type CreateInput = { scope: EmployeeScope; values: EmployeeValues };
type UpdateInput = CreateInput & { id: string };
type DeleteInput = { scope: EmployeeScope; id: string };

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scope, values }: CreateInput) =>
      createEmployeeService(createClient()).create(scope.tenantId, values),
    retry: false,
    onSuccess: async (employee, { scope }) => {
      queryClient.setQueryData(employeeKeys.detail(scope, employee.id), employee);
      await queryClient.invalidateQueries({ queryKey: employeeKeys.lists(scope) });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scope, id, values }: UpdateInput) =>
      createEmployeeService(createClient()).update(scope.tenantId, id, values),
    retry: false,
    onSuccess: async (employee, { scope, id }) => {
      queryClient.setQueryData(employeeKeys.detail(scope, id), employee);
      await queryClient.invalidateQueries({ queryKey: employeeKeys.scope(scope) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scope, id }: DeleteInput) =>
      createEmployeeService(createClient()).remove(scope.tenantId, id),
    retry: false,
    onSuccess: async (_, { scope, id }) => {
      queryClient.setQueryData(employeeKeys.detail(scope, id), null);
      await queryClient.invalidateQueries({ queryKey: employeeKeys.scope(scope) });
    },
  });
}
```

## Why the mutation receives scope

The success callback uses the scope submitted with the mutation. It must not read a global "currently selected tenant" after the network request finishes, because the user may have switched tenants meanwhile.

`userId` here isolates cache entries; it does not impersonate a user. The Supabase client's session identifies the caller. The authenticated shell must keep scope consistent with that session, remount forms on scope changes, and prevent stale screens from submitting after logout. Clear sensitive queries on identity changes and cancel pending query reads through the existing auth lifecycle.

Toasts belong to the form/dialog wrapper, so each result produces one notification. The data layer and hooks remain reusable.

The sample awaits invalidation with TanStack Query's default refetch error handling. If the application changes this to throw on refresh failures, distinguish a completed write from a failed refresh so users are not encouraged to repeat an already-completed write.

Reference: [TanStack success invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations).
