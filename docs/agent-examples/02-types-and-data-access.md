# Example 2: Types and Data Access

These snippets depend on types generated from [the example migration](01-database-and-permissions.md). Use the actual generated package export in your repository.

## `features/employees/types/index.ts`

```ts
import type { Database } from '@repo/database';
import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Use 120 characters or fewer'),
});

export type EmployeeValues = z.infer<typeof employeeSchema>;
export type Employee = Pick<
  Database['public']['Tables']['employees']['Row'],
  'id' | 'tenant_id' | 'name' | 'created_at'
>;

export type EmployeeScope = { tenantId: string; userId: string };
export type EmployeeListParams = { page: number; pageSize: number };
export type EmployeeList = { items: Employee[]; total: number };
```

This example's schema trims strings without changing their TypeScript type. For schemas that change types, distinguish Zod input/output types in React Hook Form.

## `features/employees/services/api.ts`

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { z } from 'zod';
import {
  employeeSchema,
  type Employee,
  type EmployeeList,
  type EmployeeListParams,
  type EmployeeValues,
} from '../types';

const idSchema = z.string().uuid();
const pageSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
});
const columns = 'id, tenant_id, name, created_at' as const;

export class EmployeeRequestError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
    this.name = 'EmployeeRequestError';
  }
}

function throwRequestError(error: { code: string }): never {
  throw new EmployeeRequestError(
    'The employee request could not be completed. Please try again.',
    error.code,
  );
}

export function createEmployeeService(client: SupabaseClient<Database>) {
  return {
    async list(tenantId: string, params: EmployeeListParams): Promise<EmployeeList> {
      const tenant = idSchema.parse(tenantId);
      const { page, pageSize } = pageSchema.parse(params);
      const from = (page - 1) * pageSize;
      const { data, error, count } = await client
        .from('employees')
        .select(columns, { count: 'exact' })
        .eq('tenant_id', tenant)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) throwRequestError(error);
      if (data === null || count === null) {
        throw new EmployeeRequestError('The employee list was incomplete.', 'INVALID_RESULT');
      }
      return { items: data, total: count };
    },

    async get(tenantId: string, id: string): Promise<Employee | null> {
      const { data, error } = await client
        .from('employees')
        .select(columns)
        .eq('tenant_id', idSchema.parse(tenantId))
        .eq('id', idSchema.parse(id))
        .maybeSingle();

      if (error) throwRequestError(error);
      return data;
    },

    async create(tenantId: string, values: EmployeeValues): Promise<Employee> {
      const payload = employeeSchema.parse(values);
      const { data, error } = await client
        .from('employees')
        .insert({ tenant_id: idSchema.parse(tenantId), name: payload.name })
        .select(columns)
        .single();

      if (error) throwRequestError(error);
      if (!data) throw new EmployeeRequestError('No employee was returned.', 'INVALID_RESULT');
      return data;
    },

    async update(tenantId: string, id: string, values: EmployeeValues): Promise<Employee> {
      const payload = employeeSchema.parse(values);
      const { data, error } = await client
        .from('employees')
        .update({ name: payload.name })
        .eq('tenant_id', idSchema.parse(tenantId))
        .eq('id', idSchema.parse(id))
        .select(columns)
        .single();

      if (error) throwRequestError(error);
      if (!data) throw new EmployeeRequestError('No employee was returned.', 'INVALID_RESULT');
      return data;
    },

    async remove(tenantId: string, id: string): Promise<void> {
      const { data, error } = await client
        .from('employees')
        .delete()
        .eq('tenant_id', idSchema.parse(tenantId))
        .eq('id', idSchema.parse(id))
        .select('id')
        .single();

      if (error) throwRequestError(error);
      if (!data) throw new EmployeeRequestError('No employee was deleted.', 'INVALID_RESULT');
    },
  };
}

export type EmployeeService = ReturnType<typeof createEmployeeService>;
```

## Design decisions

- The service receives a typed client; it does not own cookies, React hooks, toasts, or administrative credentials.
- The caller supplies tenant scope, but database authorization remains authoritative.
- Update payloads contain only editable fields. A generic spread of a fetched row could try to update protected columns.
- Writes request a returned row and require a single result, avoiding a false success when an RLS-filtered update/delete affects zero rows.
- Detail reads intentionally return `null` for an unavailable record without revealing whether another tenant owns it.
- RLS may make a list return zero visible records without an error. The app must establish valid tenant membership before mounting the feature; an empty list does not prove access.
- Error messages shown to users are sanitized. In production, use the existing error mapper and safe telemetry, including field-specific validation where supported.
- Exact counts and offset pagination are suitable for this small reference. Choose the established cursor/count strategy for large datasets; do not copy offset pagination blindly.

Reference: [Supabase returning modified rows](https://supabase.com/docs/reference/javascript/using-modifiers-select).
