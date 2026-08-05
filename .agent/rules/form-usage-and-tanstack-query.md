---
trigger: always_on
---

# Form Reusability & TanStack Query Standards 🚀📋

This document outlines the strict guidelines for forms, data fetching with TanStack Query, filter parameters, details fetching, and file/folder structures.

---

## 1. Feature Folder Architecture (`src/features/[feature]/`) 📂

Business logic and data fetching logic MUST live under `src/features/[feature]/`:

```text
src/features/[feature]/
├── services/
│   ├── api.ts          # Pure Axios API methods
│   ├── queries.ts      # TanStack useQuery hooks
│   └── mutations.ts    # TanStack useMutation hooks
└── types/
    └── index.ts        # Clean Zod schemas & TypeScript types
```

---

## 2. TanStack Query & Filtering Guidelines ⚡️

### A. All Filter Parameters MUST Be Optional
When creating filter interfaces, every single field must be marked optional (`?`).

- **❌ FORBIDDEN**: Requiring filter parameters or passing hardcoded `'ALL'` strings to backend endpoints.
- **✅ REQUIRED**:

```typescript
// src/features/employees/types/index.ts
export interface EmployeeFilterParams {
  limit?: number;
  cursor?: string;
  search?: string;
  departmentId?: string;
  positionId?: string;
  status?: string;
  type?: string;
}
```

### B. Clean Query Serialization (`api.ts` & `queries.ts`)

```typescript
// src/features/employees/services/api.ts
import { supabase } from '@/lib/supabase/client';
import { EmployeeData, EmployeeFilterParams, EmployeeDetailData, EmployeeCreatePayload, EmployeeUpdatePayload } from '../types';

const employeesApiService = {
  // 1. List query with optional filters using Supabase
  getEmployees: async (params: EmployeeFilterParams) => {
    let query = supabase.from('employees').select('*');

    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    if (params.departmentId) {
      query = query.eq('department_id', params.departmentId);
    }
    if (params.positionId) {
      query = query.eq('position_id', params.positionId);
    }
    if (params.status) {
      query = query.eq('status', params.status);
    }
    if (params.type) {
      query = query.eq('type', params.type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as EmployeeData[];
  },

  // 2. Single detail query
  getEmployeeById: async (id: string) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as EmployeeDetailData;
  },

  // 3. Create employee
  createEmployee: async (payload: EmployeeCreatePayload) => {
    const { data, error } = await supabase
      .from('employees')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as EmployeeData;
  },

  // 4. Update employee
  updateEmployee: async (id: string, payload: EmployeeUpdatePayload) => {
    const { data, error } = await supabase
      .from('employees')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as EmployeeData;
  },

  // 5. Delete employee
  deleteEmployee: async (id: string) => {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};

export default employeesApiService;
```

```typescript
// src/features/employees/services/queries.ts
import { useQuery } from '@tanstack/react-query';
import employeesApiService from './api';
import { EmployeeFilterParams } from '../types';

// List query hook
export const useGetEmployees = (params: EmployeeFilterParams) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeesApiService.getEmployees(params),
  });
};

// Detail query hook (enabled only when id is present)
export const useGetEmployeeById = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApiService.getEmployeeById(id),
    enabled: !!id,
  });
};
```

---

## 3. TanStack Query Mutation Standards (`mutations.ts`) 🔄

Mutation hooks handle POST, PATCH/PUT, and DELETE operations. They **MUST**:
1. Be placed in `src/features/[feature]/services/mutations.ts`.
2. Use `useMutation` from `@tanstack/react-query`.
3. Provide user feedback via `toast` notification (`toast.success` / `toast.error` from `sonner`).
4. **Await Query Invalidation**: Always `await queryClient.invalidateQueries({ queryKey: [...] })` in `onSettled` to immediately refetch affected list and detail queries.

### Mutation Hook Pattern Example (`mutations.ts`)

```typescript
// src/features/employees/services/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import employeesApiService from './api';
import { EmployeeCreatePayload, EmployeeUpdatePayload } from '../types';

// 1. Create Mutation
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeCreatePayload) => employeesApiService.createEmployee(data),
    onSettled: async (response, error) => {
      if (error) {
        toast.error((error as Error)?.message || 'Failed to create employee');
      } else {
        toast.success('Employee created successfully');
        await queryClient.invalidateQueries({ queryKey: ['employees'] });
      }
    },
  });
};

// 2. Update Mutation
export const useUpdateEmployee = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeUpdatePayload) => employeesApiService.updateEmployee(id, data),
    onSettled: async (response, error) => {
      if (error) {
        toast.error((error as Error)?.message || 'Failed to update employee');
      } else {
        toast.success('Employee updated successfully');
        await queryClient.invalidateQueries({ queryKey: ['employees'] });
        await queryClient.invalidateQueries({ queryKey: ['employee', id] });
      }
    },
  });
};

// 3. Delete Mutation
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApiService.deleteEmployee(id),
    onSettled: async (response, error) => {
      if (error) {
        toast.error((error as Error)?.message || 'Failed to delete employee');
      } else {
        toast.success('Employee deleted successfully');
        await queryClient.invalidateQueries({ queryKey: ['employees'] });
      }
    },
  });
};
```


---

## 4. Reusable Form Architecture (Create & Edit Modes) 📋

Forms MUST be split into 3 clean pieces to enable 100% UI reusability between **Create** and **Edit** modes:

1. **Shared Form UI Component** (`_components/sample-form.tsx`)
2. **Create Wrapper** (`create/_components/create-sample-form.tsx`)
3. **Edit Wrapper** (`edit/_components/edit-sample-form.tsx`)

### Piece 1: Shared Form UI Component (`_components/sample-form.tsx`)
Accepts `form` (from `react-hook-form`), `mode` (`'create' | 'update'`), and `isLoading`:

- **❌ FORBIDDEN**: Creating separate input layouts for Create and Edit forms.
- **✅ REQUIRED**:

```tsx
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Flex, Grid } from '@radix-ui/themes';
import { SampleCreatePayload } from '@/features/sample/types';

interface SampleFormProps {
  form: UseFormReturn<SampleCreatePayload>;
  mode: 'create' | 'update';
  isLoading: boolean;
}

const SampleForm: React.FC<SampleFormProps> = ({ form, mode, isLoading }) => {
  return (
    <div className="space-y-4">
      <Grid columns={{ initial: '1', md: '2' }} gap="4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter name" className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Grid>
      <Flex justify="end" gap="3">
        <Button type="submit" loading={isLoading}>
          {mode === 'create' ? 'Create' : 'Update'}
        </Button>
      </Flex>
    </div>
  );
};

export default SampleForm;
```

### Piece 2: Create Form Wrapper (`create/_components/create-sample-form.tsx`)

```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { sampleCreateSchema, SampleCreatePayload } from '@/features/sample/types';
import { useCreateSample } from '@/features/sample/services/mutations';
import SampleForm from '../../_components/sample-form';

const CreateSampleForm = () => {
  const { mutateAsync, isPending } = useCreateSample();
  const form = useForm<SampleCreatePayload>({
    resolver: zodResolver(sampleCreateSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (values: SampleCreatePayload) => {
    await mutateAsync(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SampleForm form={form} mode="create" isLoading={isPending} />
      </form>
    </Form>
  );
};

export default CreateSampleForm;
```

### Piece 3: Edit Form Wrapper (`edit/_components/edit-sample-form.tsx`)

```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { sampleCreateSchema, SampleCreatePayload, SampleDetailData } from '@/features/sample/types';
import { useUpdateSample } from '@/features/sample/services/mutations';
import SampleForm from '../../_components/sample-form';

const EditSampleForm = ({ id, data }: { id: string; data: SampleDetailData }) => {
  const { mutateAsync, isPending } = useUpdateSample(id);
  const form = useForm<SampleCreatePayload>({
    resolver: zodResolver(sampleCreateSchema),
    defaultValues: { name: data.name },
  });

  const onSubmit = async (values: SampleCreatePayload) => {
    await mutateAsync(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SampleForm form={form} mode="update" isLoading={isPending} />
      </form>
    </Form>
  );
};

export default EditSampleForm;
```
