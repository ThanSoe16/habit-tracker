---
trigger: always_on
---

# Coding and architecture

## Workflow

Read the project rules and relevant code, review supplied files as task material,
state the intended approach, then carry out the user's authorized request.
Do not require a separate kickoff confirmation for work already requested.
Preserve unrelated edits and verify the affected behavior before reporting completion.
For complex work, keep concise working notes on decisions, assumptions, and pending
checks. Never put credentials or private records in notes. Supplied examples are
task material; inspect their contracts before adopting them.

## Stack and project discovery

These conventions target Next.js App Router, TypeScript, Tailwind, shadcn/Radix,
React Hook Form, Zod, Supabase, Zustand, nuqs, and TanStack Query. Inspect
`package.json`, the lockfile, aliases, and workspace configuration before coding.
Use installed versions and the project's package manager; never assume latest or
invent monorepo packages. Example paths describe a single app and may be prefixed
by a package directory in an existing workspace.

Reuse the established authentication/session lifecycle. For Supabase, use its
approved browser client and normal user session. Do not introduce cookie/token
storage or a second auth flow from a copied example. Route guards improve the UI;
database grants and RLS remain responsible for authorization.

Supabase application data fetching is client-side only. Do not fetch it in Server
Components, Server Actions, Route Handlers, or server prefetch/hydration paths.
New application mutations use client mutation hooks unless the user explicitly
requests another approach. Keep administrative credentials in trusted tooling.
If a project already uses HTTP endpoints, reuse its approved HTTP client; do not
add Axios or invent response envelopes just because a sample uses them.

## Placement and responsibilities

- `src/app/`: routing, layouts, and server boundaries. Route pages compose page components.
- `src/components/pages/`: page orchestration, shared create/edit forms, and local `_components/`.
- `src/components/shared/`: reusable application components.
- `src/components/ui/`: installed UI primitives; inspect their actual contracts.
- `src/features/<feature>/types/`: validation schemas and domain types.
- `src/features/<feature>/services/`: data access, query keys, queries, and mutations.
- `src/features/<feature>/hooks/`: feature-specific orchestration.
- `src/store/` and existing feature stores: current Zustand state and synchronization.
- `src/lib/supabase/`: shared client/auth boundaries; admin credentials stay server-side.
- `supabase/migrations/`: incremental database changes adapted to real migration history.

Keep services independent of forms, navigation, and notifications. New CRUD features
separate service access, query/mutation hooks, shared form UI, and wrappers. Existing Zustand
synchronization has persistence, optimistic updates, and retry queues: migrate a
complete flow and its consumers together, preserving these behaviors. Do not run
competing Zustand and Query write paths for the same feature.

Give state one owner: Query for new server-data flows, React Hook Form for form
state, nuqs for shareable URL state, and Zustand for shared client state. Use local
React state when only one component needs it. Keep typed store actions, focused
selectors, deliberate persistence, and account-aware reset/hydration behavior.

## Example: feature folder structure

```text
src/
├── app/
│   ├── items/page.tsx
│   └── layout.tsx
├── components/
│   ├── pages/items/
│   │   ├── index.tsx
│   │   └── _components/
│   │       ├── column-defs.tsx
│   │       ├── item-form.tsx
│   │       ├── create-item-form.tsx
│   │       └── edit-item-form.tsx
│   ├── shared/
│   └── ui/
├── features/items/
│   ├── types/index.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── query-keys.ts
│   │   ├── queries.ts
│   │   └── mutations.ts
│   ├── hooks/
│   └── store/
├── store/
├── hooks/
├── lib/
└── utils/
```

Create only the directories needed by the feature. Keep page-specific components
local; move matching UI used across features into `components/shared/`. Keep an
existing shared UI package's ownership when working in a workspace.

## Conventions

Use kebab-case for new application filenames, PascalCase for components, and
camelCase for functions and variables. Fully type props and public service contracts.
Do not use `any` or unsafe casts to bypass a missing contract.
Keep components under 300 lines; extract coherent components and domain logic when
working on oversized pages. Preserve framework-mandated and existing public paths.
Use semantic theme tokens, standard spacing, and Radix Themes Flex/Grid for app layout.
Reuse existing utilities after checking their exports. Inspect existing base/global
hooks before adding pagination, debounce, responsive, network, or storage helpers.
Do not assume a helper exists because its name appears in a reference. Preserve
legacy public filenames rather than renaming them just to match new naming rules.

Use the actual DataTable and pagination-hook contracts for paginated
lists. Follow the form and styling rules for feedback, pending states, and delete
confirmation. Treat unrelated legacy violations as tracked migration work rather
than silently claiming repository-wide compliance.

## Example: minimal route and client page

The route composes the page. The client page owns interaction and hosts client
query/form components under the established authenticated providers. This small
example demonstrates that boundary without adding a database request.

```tsx
// src/app/items/page.tsx
import ItemsPage from '@/components/pages/items';

export default function Page() {
  return <ItemsPage />;
}
```

```tsx
// src/components/pages/items/index.tsx
'use client';

import { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';

export default function ItemsPage() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <Flex direction="column" gap="4">
      <h1 className="text-2xl font-semibold text-foreground">Items</h1>
      <Button
        type="button"
        variant="outline"
        aria-expanded={showHelp}
        aria-controls="items-help"
        onClick={() => setShowHelp((visible) => !visible)}
      >
        {showHelp ? 'Hide help' : 'Show help'}
      </Button>
      <p id="items-help" hidden={!showHelp} className="text-muted-foreground">
        Create an item, then select it to edit its details.
      </p>
    </Flex>
  );
}
```

## Formatting and feature workflow

Follow checked-in Prettier and ESLint configuration and existing scripts. If a new
project has no formatting policy, use these defaults. Do not replace an established
configuration or disable diagnostics to make new code pass.

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

For a new CRUD feature:

1. Establish the real schema, authorization, generated types, and input validation.
2. Add pure services with explicit payloads and failure behavior.
3. Add scoped query keys and client query/mutation hooks.
4. Build shared create/edit fields and wrappers that own submission and feedback.
5. Compose page-local components and reuse shared table/filter/dialog components.
6. Add a minimal route and verify provider/auth integration.
7. Run focused checks for the affected behavior and report actual results and gaps.

Keep code examples inline and label prerequisites. Do not require separate sample
documents or copy nonexistent imports, component props, or package names.
