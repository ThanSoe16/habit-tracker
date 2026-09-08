# Example 4: Shared Form and Page Composition

The snippets use the existing Shadcn form integration described in your original rules. Verify imports and component props in the actual app. The button uses standard `disabled` and visible pending text instead of assuming a custom `loading` prop.

## `components/pages/employees/_components/employee-form.tsx`

```tsx
'use client';

import type { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import type { EmployeeValues } from '@/features/employees/types';

type Props = {
  form: UseFormReturn<EmployeeValues>;
  mode: 'create' | 'update';
  onSubmit: SubmitHandler<EmployeeValues>;
};

export function EmployeeForm({ form, mode, onSubmit }: Props) {
  const pending = form.formState.isSubmitting;
  const error = form.formState.errors.root?.server?.message;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-busy={pending}>
        <fieldset disabled={pending}>
          <legend className="sr-only">Employee details</legend>
          <Flex direction="column" gap="4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee name</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={120} autoComplete="name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p role="alert" className="text-destructive">{error}</p>}
            <Flex justify="end">
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving…' : mode === 'create' ? 'Create employee' : 'Save changes'}
              </Button>
            </Flex>
          </Flex>
        </fieldset>
      </form>
    </Form>
  );
}
```

The shared form knows fields and presentation. It does not import Supabase, choose tenant scope, or decide where to navigate.

## `create/_components/create-employee-form.tsx`

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { EmployeeForm } from '../../_components/employee-form';
import { useCreateEmployee } from '@/features/employees/services/mutations';
import {
  employeeSchema, type EmployeeScope, type EmployeeValues,
} from '@/features/employees/types';

export function CreateEmployeeForm({ scope }: { scope: EmployeeScope }) {
  const mutation = useCreateEmployee();
  const form = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: '' },
  });

  async function onSubmit(values: EmployeeValues) {
    form.clearErrors('root');
    try {
      await mutation.mutateAsync({ scope, values });
    } catch {
      form.setError('root.server', {
        message: 'Could not create the employee. Your input has been kept.',
      });
      return;
    }
    form.reset({ name: '' });
    toast.success('Employee created');
  }

  return <EmployeeForm form={form} mode="create" onSubmit={onSubmit} />;
}
```

The authenticated parent renders this wrapper with ``key={`${scope.userId}:${scope.tenantId}`}``. Remounting on scope change prevents one tenant's unfinished form from becoming another tenant's submission. Apply the existing unsaved-changes policy before switching scope.

## `edit/_components/edit-employee-form.tsx`

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { EmployeeForm } from '../../_components/employee-form';
import { useUpdateEmployee } from '@/features/employees/services/mutations';
import {
  employeeSchema, type Employee, type EmployeeScope, type EmployeeValues,
} from '@/features/employees/types';

export function EditEmployeeForm({ scope, employee }: {
  scope: EmployeeScope;
  employee: Employee;
}) {
  const mutation = useUpdateEmployee();
  const form = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: employee.name },
  });

  async function onSubmit(values: EmployeeValues) {
    form.clearErrors('root');
    let saved: Employee;
    try {
      saved = await mutation.mutateAsync({ scope, id: employee.id, values });
    } catch {
      form.setError('root.server', {
        message: 'Could not save changes. Your input has been kept.',
      });
      return;
    }
    form.reset({ name: saved.name });
    toast.success('Employee updated');
  }

  return <EmployeeForm form={form} mode="update" onSubmit={onSubmit} />;
}
```

Do not add an unconditional `reset(employee)` effect on every query update: it can overwrite an in-progress edit. This example intentionally keeps the initial form snapshot until save or remount. If live external edits matter, show a refresh/conflict workflow instead of silently replacing user input.

## `edit/index.tsx`

```tsx
'use client';

import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployee } from '@/features/employees/services/queries';
import type { EmployeeScope } from '@/features/employees/types';
import { EditEmployeeForm } from './_components/edit-employee-form';

export function EmployeeEditPage({ scope, id }: { scope: EmployeeScope; id: string }) {
  const query = useEmployee(scope, id);

  if (query.isPending) {
    return <Skeleton className="h-32 w-full" aria-label="Loading employee" />;
  }
  if (query.isError && query.data === undefined) {
    return (
      <Flex direction="column" gap="3">
        <p role="alert">Could not load this employee.</p>
        <Button disabled={query.isFetching} onClick={() => { void query.refetch(); }}>
          Retry
        </Button>
      </Flex>
    );
  }
  if (!query.data) {
    return <p>This employee is unavailable or you do not have access.</p>;
  }

  return (
    <Flex direction="column" gap="4">
      <h1>Edit employee</h1>
      {query.isError && <p role="status">Refresh failed. Your current form has been kept.</p>}
      <EditEmployeeForm
        key={`${scope.userId}:${scope.tenantId}:${id}`}
        scope={scope}
        employee={query.data}
      />
    </Flex>
  );
}
```

The route supplies a valid ID and authenticated scope using the real app's routing/auth integration. No fabricated server action or custom session implementation is needed for this browser/RLS pattern. If the real feature uses Server Actions, retain its server access boundary and adapt the service injection accordingly.

## Table and delete integration

- Map `useEmployees(...).data.items` and `.total` to the real shared `DataTable` contract.
- Map the real `usePagination` URL state to `{ page, pageSize }`; do not assume its page index starts at one.
- Keep search/filter parameters in both the service request and query key when extending this minimal example.
- Trigger `useDeleteEmployee().mutateAsync({ scope, id })` only from the existing confirmation dialog's confirmed action.
- Keep the dialog open on failure, show a sanitized error, and disable confirmation while pending. Close or navigate away after successful deletion.
- Clamp or move back from an empty final page after deleting its last item, using the existing pagination contract.

The UI snippets demonstrate general failures. When the actual API supplies structured field errors, map them through the existing error helper into `form.setError` for the relevant field.
