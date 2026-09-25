---
trigger: always_on
---

# Styling and components

Use installed shadcn/Radix primitives and existing shared components. Verify local
imports and props before copying reference snippets; do not invent helpers or a
localization system. Use existing product language.
These conventions apply to dashboard feature UI. Respect shared UI package ownership.
Inline paths illustrate placement; check aliases and exports in the receiving project.

- New application files use kebab-case; component functions use PascalCase.
- Keep component files under 300 lines and extract local `_components/` as needed.
- Use semantic CSS tokens such as bg-background, bg-card, text-foreground,
  text-muted-foreground, and border-border. Avoid raw hex colors and arbitrary
  bracket spacing/sizes in application markup; prefer standard spacing tokens.
- Use Radix Themes Flex/Grid/Box for application layout. Keep styling concise and
  prefer component variants over restyling installed primitives.
- Use Radix responsive direction, alignment, and gap props instead of equivalent
  Tailwind flex/grid utilities in feature composition. Preserve primitive internals.
- Use the verified `cn()` helper for conditional/merged classes, `size-*` for equal
  dimensions, and `truncate` where appropriate. Let theme tokens handle dark mode;
  do not override component internals or overlay stacking from pages.
- Define necessary new tokens in the designated theme source. Document the smallest
  justified extension when the design system cannot express a requirement.
- Reuse Form, FormField, FormItem, FormLabel, FormControl, and FormMessage with
  React Hook Form. Preserve accessible labels and validation associations.
- Use disabled plus visible pending text unless the verified Button contract
  supports a pending prop. Do not assume `loading` or `isLoading` exists.
- Use Skeleton for initial loading; do not replace a populated form on every fetch.
- Dialogs need accessible titles; icon-only actions need accessible names.
- Preserve visible focus, keyboard operation, and dialog focus return. Do not
  communicate status through color alone. Check long text and responsive layouts.
- Destructive UI actions use the existing ConfirmationDialog with pending and
  failure handling owned by its caller.

## Reusable components

When the same UI and behavior appear in multiple places, use one reusable component
instead of copying the markup and logic. Shared fixes and styling should reach all
consumers consistently.

- Check existing components before creating a new one. Extend a suitable component
  with typed props, composition, or supported variants when needed.
- Keep components reused within one page/feature in its `_components/` directory.
  Put components reused across features in `src/components/shared/`.
  Keep installed primitives in `src/components/ui/`.
- Pass changing labels, data, pending state, and callbacks through typed props.
  Keep feature-specific fetching, mutations, navigation, and notifications in callers.
- Share matching create/edit form fields, with wrappers owning their workflows.
- Extract components around a clear responsibility. Do not force unrelated behavior
  into one component with many conditional flags or add wrappers without shared behavior.
- When extracting duplicated UI, update the affected consumers to use the shared
  component and preserve their accessibility, loading, and error behavior.

Example: if multiple forms repeat the same submit/pending behavior, they can share
this component. This illustrates a possible extraction, not an existing export.

```tsx
// src/components/shared/buttons/submit-button.tsx
import { Button } from '@/components/ui/button';

type SubmitButtonProps = {
  label: string;
  pendingLabel: string;
  isPending: boolean;
  disabled?: boolean;
};

export function SubmitButton({
  label,
  pendingLabel,
  isPending,
  disabled = false,
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={disabled || isPending} aria-busy={isPending}>
      {isPending ? pendingLabel : label}
    </Button>
  );
}
```

Create and edit wrappers supply their own labels and submission state; their form
submission handlers continue to own the mutations and feedback.

## Shared table and filter contracts

Reuse the project's DataTable, SearchInput, SelectBoxFilter, TableBaseButton, and
ConfirmationDialog where available. Inspect imports and props before wiring data,
totals, loading, callbacks, and filters. `ALL` is a UI sentinel unless the backend
supports it. Preserve established public filenames such as `usePagination.ts`.

Extract table columns to `_components/column-defs.tsx`. Use the installed TanStack
Table types only when the shared table accepts them; custom wrappers can have a
different column shape. Map the real service response. Preserve report/card presentation
unless the task calls for a table or UI redesign.

## Example: typed columns and reusable table presentation

This example's shared DataTable accepts `data`, `columns`, `total`, `query`,
`isLoading`, and `onPageChange`; pagination is one-based. Its SearchInput forwards
standard input props. These contracts are verified for the current implementation
but must be checked when copying to another project. The caller owns query hooks,
URL state, request-to-table mapping, and sanitized errors.

```tsx
// src/components/pages/items/_components/column-defs.tsx
import type { ComponentProps } from 'react';
import { DataTable } from '@/components/shared/data-table';

export type ItemTableRow = { id: string; name: string };
type ItemColumn = ComponentProps<typeof DataTable<ItemTableRow>>['columns'][number];

export const columnDefs: ItemColumn[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="text-foreground">{row.original.name}</span>,
  },
];
```

```tsx
// src/components/pages/items/_components/items-table.tsx
'use client';

import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/input/search-input';
import { columnDefs, type ItemTableRow } from './column-defs';

type ItemsTableProps = {
  data: ItemTableRow[] | undefined;
  total: number | undefined;
  query: { pageIndex: number; rowPerPage: number };
  search: string;
  isPending: boolean;
  isFetching: boolean;
  error: string | null;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
};

export function ItemsTable({
  data,
  total,
  query,
  search,
  isPending,
  isFetching,
  error,
  onSearchChange,
  onPageChange,
  onRetry,
}: ItemsTableProps) {
  return (
    <Flex direction="column" gap="4">
      <Flex direction={{ initial: 'column', sm: 'row' }} gap="3" align="start">
        <SearchInput
          aria-label="Search items"
          placeholder="Search items…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {isFetching && (
          <p role="status" className="text-muted-foreground">
            Loading items…
          </p>
        )}
      </Flex>
      {error && (
        <Flex direction="column" gap="2">
          <p role="alert" className="text-destructive">
            {error}
          </p>
          <Button type="button" variant="outline" disabled={isFetching} onClick={onRetry}>
            Retry
          </Button>
        </Flex>
      )}
      {(!error || data !== undefined) && (
        <DataTable
          columns={columnDefs}
          data={data ?? []}
          total={total}
          query={query}
          isLoading={isPending && data === undefined}
          onPageChange={onPageChange}
        />
      )}
    </Flex>
  );
}
```

Map a service page explicitly to `data={result.items}` and `total={result.total}`.
The parent search callback updates nuqs and resets page/cursor state. Do not add
another local search owner or assume a `body.data` envelope. Keep prior data only
when its identity/scope remains valid, and prevent pagination clamping against
placeholder totals for a different page/filter. An initial request failure hides
the empty table; a background failure retains previously loaded content.

For destructive actions, keep the confirmation dialog open on failure, disable
repeat confirmation while pending, and close only after success. Cancellation sends
no write. Inspect the dialog's controlled state and callback names before reuse.
