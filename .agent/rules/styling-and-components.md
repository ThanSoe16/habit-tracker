---
trigger: always_on
---

# Styling & Component Guidelines 🎨🧩

This document defines the strict UI, styling, layout, naming, and component composition standards for this repository.

---

## 1. Naming Conventions (Kebab-case / Snake-case File Names) 📁

- **Files and Folders**: All file and folder names must strictly use kebab-case / snake-case (e.g. `employee-form.tsx`, `attendance-detail-dialog.tsx`, `employee-list/`).
- **React Components**: Component functions inside code use `PascalCase` (e.g. `const EmployeeForm = () => ...`).

---

## 2. Strict Styling & Tailwind Rules 🎨

### A. Zero Hex Colors
Never use raw hex colors or arbitrary color brackets in Tailwind classes or inline styles.
- **❌ FORBIDDEN**: `bg-[#ffffff]`, `text-[#1e293b]`, `border-[#e2e8f0]`, `style={{ color: '#ff0000' }}`
- **✅ REQUIRED**: Use predefined semantic CSS variable tokens: `bg-primary`, `bg-background`, `bg-card`, `text-primary`, `text-muted-foreground`, `border-border`, `bg-destructive`.

### B. Zero Arbitrary Bracket Sizes
Never use arbitrary bracket syntax `[...]` for spacing, sizing, margins, or paddings.
- **❌ FORBIDDEN**: `p-[2px]`, `px-[15px]`, `w-[350px]`, `mt-[12px]`, `gap-[8px]`
- **✅ REQUIRED**: Use standard Tailwind spacing scale tokens (`p-0.5`, `px-4`, `mt-3`, `gap-2`, `w-80`).

### C. Avoid Long Tailwind Class Strings
Do NOT bloat components with excessively long Tailwind class strings.
- Base UI components in `src/components/ui/` and `src/components/shared/` are **already styled by default**.
- When using pre-styled components, do NOT re-apply unnecessary custom class names. Use default component styles directly.

---

## 3. Layout: Radix UI `<Flex>` & `<Grid>` Policy 🧩

- **NO Tailwind Flex Classes**: Do NOT use `flex`, `flex-row`, `flex-col`, `items-center`, `justify-between` in Tailwind class strings.
- **✅ ALWAYS Use Radix `<Flex>` & `<Grid>`**: Use Radix Themes components (`<Flex>`, `<Grid>`, `<Box>`) for layout, direction, alignment, and spacing:

```tsx
// ❌ FORBIDDEN:
<div className="flex flex-col md:flex-row items-center justify-between gap-4">...</div>

// ✅ REQUIRED:
<Flex direction={{ initial: 'column', md: 'row' }} align="center" justify="between" gap="4">
  ...
</Flex>
```

---

## 4. File Size Limit: Maximum 300 Lines 📐

- **HARD LIMIT**: Every component file must remain under **300 lines of code**.
- If a component file approaches 300 lines, immediately break it down into smaller sub-components inside the local `_components/` directory (e.g., `employee-form.tsx`, `column-defs.tsx`).

---

## 5. Folder Structure Rules 📂

Keep UI components strictly organized in their designated directories:

```text
src/
├── app/(modules)/employees/       # Next.js App Router (Minimal route wrapper page.tsx)
├── components/pages/employees/    # Main Page UI Orchestration
│   └── list/
│       ├── index.tsx              # Main page component (< 300 lines)
│       └── _components/           # Localized sub-components (kebab-case file names)
├── components/shared/             # Pre-styled reusable domain wrappers (DataTable, Inputs)
└── components/ui/                 # Pre-styled base primitives (Button, Input, Dialog, Form)
```

---

## 6. Form UI Structure 📋

Bind Shadcn Form primitives (`<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`) to `react-hook-form`. Always include `<FormMessage />` for validation errors:

```tsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Employee Name</FormLabel>
      <FormControl>
        <Input {...field} placeholder="Enter name" className="w-full" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 7. Standard Shared Components & UI Patterns 🛠️

### A. URL Query State Management (`nuqs` + `usePagination`)
All pagination, table search, and dropdown filter states MUST sync with URL search params via `nuqs` (using `usePagination()` from `@/features/base/hooks/usePagination.ts`).

```tsx
import { usePagination } from '@/features/base/hooks/usePagination';

const {
  query,              // { pageIndex, rowPerPage, word, cursor }
  handleSearchChange, // Resets pageIndex to 1 and sets URL search param
  status, setStatus,  // Query state for status filter ('ALL', 'ACTIVE', 'INACTIVE')
  departmentId, setDepartmentId,
  positionId, setPositionId,
} = usePagination();
```

---

### B. DataTable & Pagination (`src/components/shared/data-table/index.tsx`)
- **Usage**: Always use the shared `<DataTable>` component for rendering paginated lists.
- **nuqs Integration**: Pass `query` from `usePagination()` directly to `<DataTable>`.
- **Automatic Loading State**: `<DataTable>` built-in `isLoading` prop automatically displays table skeletons while data is being fetched.

```tsx
<DataTable
  columns={columnDefs}
  data={data?.body?.data ?? []}
  total={data?.body?.total}
  query={query}
  isLoading={isLoading}
  renderHeader={() => (
    <Flex align="center" gap="3" wrap="wrap">
      <SearchInput
        placeholder="Search employees..."
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <SelectBoxFilter
        title="Status"
        selectParam="status"
        value={status}
        arr={statusOptions}
        onChange={(val) => setStatus(val)}
      />
    </Flex>
  )}
/>
```

---

### C. Search Input & SelectBoxFilter (`nuqs`-backed Filters)
- **SearchInput**: Use `@/components/shared/input/search-input`. Binds to `usePagination().handleSearchChange` to sync `?search=...` in URL via `nuqs`.
- **SelectBoxFilter**: Use `@/components/shared/input/select-box-filter`. Directly supports `selectParam` (URL parameter key) powered by `nuqs`'s `useQueryState`.

```tsx
// Dropdown options array format:
const statusOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

<SelectBoxFilter
  title="Status"
  selectParam="status"
  value={status}
  arr={statusOptions}
  onChange={(val) => setStatus(val)}
/>
```

---

### D. Delete Actions & Confirmation Dialog (`src/components/shared/dialog/confirmation-dialog.tsx`)
- **Mandatory Confirmation**: Every delete or destructive action MUST use `<ConfirmationDialog>`. Do NOT execute instant deletes without user confirmation.

```tsx
<ConfirmationDialog
  open={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  title="Delete Employee"
  desc="Are you sure you want to delete this employee? This action cannot be undone."
  isDelete={true}
  enableDeleteIcon={true}
  confirmText="Delete"
  isLoading={isDeleting}
  onPress={handleConfirmDelete}
/>
```

---

### E. Skeleton Loading Standard (`src/components/ui/skeleton.tsx`)
- **Page & Card Loading**: Every detail view or custom component page must present `<Skeleton />` containers while queries are fetching (`isLoading === true`).

```tsx
if (isLoading) {
  return (
    <Flex direction="column" gap="4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </Flex>
  );
}
```

---

### F. Table Column Definitions (`ColumnDef` from `@tanstack/react-table`)
- **Location**: Column definitions must be extracted into `_components/columnDefs.tsx` to keep the main page under 300 lines.
- **Header & Localization**: Headers use `useDynamicLocals()` or string titles.
- **Row Actions**: Table row actions use `<TableBaseButton>` (`uiType="edit"`, `uiType="details"`, `uiType="delete"`, `uiType="block"`).

```tsx
import { ColumnDef } from '@tanstack/react-table';
import { Flex, Text } from '@radix-ui/themes';
import TableBaseButton from '@/components/shared/buttons/table-base-button';
import { EmployeeData } from '@/features/employees/types';

export const columnDefs: ColumnDef<EmployeeData>[] = [
  {
    accessorKey: 'name',
    header: 'Employee Name',
    cell: ({ row }) => (
      <Flex align="center" gap="2">
        <Text weight="bold">{row.original.name}</Text>
      </Flex>
    ),
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ row }) => row.original.department?.name?.en ?? '-',
  },
  {
    accessorKey: 'action',
    header: () => <Text align="right">Actions</Text>,
    cell: ({ row }) => <ActionCell data={row.original} />,
  },
];
```




