---
trigger: always_on
---

# Styling and components

Use installed shadcn/Radix primitives and existing shared components. Verify local
imports and props before copying reference snippets; do not invent helpers or a
localization system. Use existing product language.

- New application files use kebab-case; component functions use PascalCase.
- Keep component files under 300 lines and extract local `_components/` as needed.
- Use semantic CSS tokens such as bg-background, bg-card, text-foreground,
  text-muted-foreground, and border-border. Avoid raw hex colors and arbitrary
  bracket spacing/sizes in application markup; prefer standard spacing tokens.
- Use Radix Themes Flex/Grid/Box for application layout. Keep styling concise and
  prefer component variants over restyling installed primitives.
- Reuse Form, FormField, FormItem, FormLabel, FormControl, and FormMessage with
  React Hook Form. Preserve accessible labels and validation associations.
- The installed Button has no loading prop. Use disabled plus visible pending text.
- Use Skeleton for initial loading; do not replace a populated form on every fetch.
- Dialogs need accessible titles; icon-only actions need accessible names.
- Destructive UI actions use the existing ConfirmationDialog with pending and
  failure handling owned by its caller.

## Existing integration points

- `src/components/shared/data-table/index.tsx`: inspect its current data, total,
  query, loading, and header props before wiring a paginated list.
- `src/features/base/hooks/usePagination.ts`: nuqs state with one-based pageIndex,
  rowPerPage, word, and cursor. Do not assume a zero-based table contract.
- `src/components/shared/input/search-input.tsx` and `select-box-filter.tsx`:
  existing search/filter controls. ALL is a UI sentinel, not a backend filter.
- `src/components/shared/dialog/confirmation-dialog.tsx`: controlled open/onClose,
  onPress, and isLoading. Keep open on rejected writes and close on success.
- `src/components/shared/buttons/table-base-button.tsx`: shared table actions.
- `src/components/ui/`: inspect actual primitive APIs before use.

Extract table columns to `_components/column-defs.tsx`. Use the installed TanStack
Table version and local DataTable contract rather than assuming the reference's
illustrative response envelope. Preserve established report/card presentation
unless the task calls for a table or UI redesign.
