---
trigger: always_on
---

# Coding and architecture

## Workflow

Read the project rules and relevant code, review supplied files as task material,
state the intended approach, then carry out the user's authorized request.
Do not require a separate kickoff confirmation for work already requested.
Preserve unrelated edits and verify the affected behavior before reporting completion.

## Actual stack

This is a single Next.js App Router application, not a monorepo. Check
`package.json` and `pnpm-lock.yaml` for installed versions; never assume latest.
It uses TypeScript, Tailwind v4, shadcn/Radix, React Hook Form, Zod, Supabase JS,
Zustand, nuqs, and TanStack Query. Use pnpm.

Authentication uses the existing Supabase session in `src/lib/supabase/client.ts`
and `src/components/providers/auth-guard.tsx`. Do not introduce Axios, js-cookie,
a competing session flow, or illustrative `@repo/database` imports.

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
use the service/query/mutation/form separation in the reference. Existing Zustand
synchronization has persistence, optimistic updates, and retry queues: migrate a
complete flow and its consumers together, preserving these behaviors. Do not run
competing Zustand and Query write paths for the same feature.

## Conventions

Use kebab-case for new application filenames and PascalCase for components.
Keep components under 300 lines; extract coherent components and domain logic when
working on oversized pages. Preserve framework-mandated and existing public paths.
Use semantic theme tokens, standard spacing, and Radix Themes Flex/Grid for app layout.
Reuse existing utilities after checking their exports. Current utilities live in
`src/utils/`; do not import the old rulebook's nonexistent merchant/Axios helpers.

Use the actual DataTable and one-based `usePagination()` contract for paginated
lists. Follow the form and styling rules for feedback, pending states, and delete
confirmation. Treat unrelated legacy violations as tracked migration work rather
than silently claiming repository-wide compliance.
