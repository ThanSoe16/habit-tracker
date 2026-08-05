---
trigger: always_on
---

# Master Rulebook 🤖📝

Welcome! If you are an AI assistant (specifically Antigravity), **read this entire file** before starting any coding task for this project. This rulebook ensures you perfectly align with the existing project architecture, conventions, and strictly adhere to the user's workflow.

> [!IMPORTANT]
> Detailed specialized standards are documented in dedicated rule files:
> - 🎨 **Styling & Component UI Standards**: [styling-and-components.md](./styling-and-components.md)
> - 📋 **Form Reusability & TanStack Query Standards**: [form-usage-and-tanstack-query.md](./form-usage-and-tanstack-query.md)

---

## 1. Kickoff & Note-Taking Protocol 🎬

Whenever a new session starts, follow these exact steps:

1. **Acknowledge:** Confirm you have read this rulebook and understand the project context.
2. **Review Uploaded Files:** Analyze any new files or folders uploaded.
3. **Formulate a Plan:** Outline a clear plan of action (step-by-step) before making any code changes. Do not jump straight into coding.
4. **Draft Notes:** Take your own working notes in a scratchpad (like `/tmp/working_notes.md`) to keep track of variables, missing props, and dependencies.
5. **Ask for the Green Light:** Ask the user, "I have reviewed your files and outlined my approach. Are you ready for me to start coding?" and wait for their confirmation.

---

## 2. Project Architecture & Stack 🏗️

This project is a very strictly structured enterprise-level dashboard.

**Tech Stack:**

- **Framework:** Next.js (App Router - `src/app`)
- **Language:** TypeScript (Strict checking enabled)
- **Styling:** Tailwind CSS + Shadcn UI (installed in `src/components/ui/`)
- **State Management:** Zustand (`src/store/*`)
- **Data Fetching:** Axios + React Query (`@tanstack/react-query`)
- **Forms & Validation:** React Hook Form + Zod
- **Tables:** TanStack Table (`@tanstack/react-table`)
- **Authentication:** Token & Refresh Token-based (Stored in `js-cookie`) - Managed via `middleware.ts`.
  _(Note: Always assume the latest major version for packages unless otherwise specified.)_

---

## 3. Strict Folder Structure Rules 📂

Code must be placed in the correct directories as defined by the directory tree below:

```text
src/
│
├── app/                        # App Router (Next.js routing)
│   ├── (modules)/              # Protected module routes
│   │   └── [feature]/          # Feature route wrapper (minimal logic)
│   │       └── page.tsx        # Entry point: only imports the main page component
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
│
├── components/
│   ├── pages/                  # Main page components (The orchestration)
│   │   └── [feature]/
│   │       ├── index.tsx       # Entry point for the feature UI (< 300 lines)
│   │       └── _components/    # Localized sub-components (kebab-case file names)
│   ├── shared/                 # Reusable generic components (Buttons, Inputs, DataTable)
│   └── ui/                     # Base primitives (Shadcn UI / Radix)
│
├── features/                   # Business logic (The "isolated brains")
│   └── [feature]/
│       ├── services/
│       │   ├── api.ts          # Axios API methods
│       │   ├── queries.ts      # useQuery hooks
│       │   └── mutations.ts    # useMutation hooks
│       ├── types/              # Zod schemas & TypeScript types
│       └── hooks/              # Feature-specific logic
│
├── store/                      # Global Zustand state
├── lib/                        # Core utilities (appAxios, utils)
├── hooks/                      # Global reusable hooks
└── utils/                      # Helper functions
```

---

## 4. Summary of Key Coding Conventions 🚀

- **HARD LIMIT: Maximum 300 lines of code per file.** Break down large files into `_components/`.
- **Naming**: File & folder names MUST strictly use **kebab-case** (e.g. `employee-form.tsx`).
- **Styling**: Zero hex colors (`bg-[#...]`) and zero arbitrary pixel sizes (`p-[2px]`). Use CSS variable tokens and standard Tailwind spacing scale.
- **Layout**: Do NOT use Tailwind flex classes (`flex`, `flex-col`, `items-center`). ALWAYS use Radix Themes (`<Flex>`, `<Grid>`).
- **Data Fetching & Mutations**: React Query hooks in `features/[feature]/services/queries.ts` and `mutations.ts`. Await query invalidation in `onSettled`.
- **Forms**: Split into 3 clean pieces (Shared Form UI, Create Wrapper, Edit Wrapper) to ensure 100% UI reusability. Refer to [form-usage-and-tanstack-query.md](./form-usage-and-tanstack-query.md).
- **Tables & Filters**: Always use `<DataTable>` backed by `usePagination()` (`nuqs` URL search params).
- **Delete Actions**: Every destructive action MUST use `<ConfirmationDialog>`.

---

## 5. Core Utility Helpers & Base Hooks 🛠️

Always use pre-existing utilities instead of rewriting custom helpers:

1. **`objectToQueryString`** (`@/utils/objectToQueryString`):
   - Converts objects to sanitized query strings for Axios GET calls, filtering out `undefined`, `null`, and `''`.

2. **Currency Formatting** (`@/utils/currencyFormat`):
   - `CurrencyFormat(num)`: Formats numbers with comma separators (e.g. `1,234.56`).
   - `MMKCurrencyFormat(num)`: Rounds and formats integer amounts.
   - `BalanceCurrencyFormat(num)`: Formats balance to 2 decimal places with commas.

3. **Timezone-Aware Date Utilities** (`@/utils/dateTime`):
   - `formatDateTime(date)`: Formats to `DD MMM YYYY, HH:mm` in configured merchant timezone.
   - `formatAPIDate(date)`: Formats to `YYYY-MM-DD` for API payloads.
   - `getMerchantNow()`: Returns current Dayjs object in merchant timezone.

4. **Sanitize File Uploads** (`@/utils/cleanAndRenameFile`):
   - `cleanAndRenameFile(file)`: Cleans file names by stripping non-standard Unicode characters before uploading.

5. **`usePagination` Hook** (`@/features/base/hooks/usePagination`):
   - Integrates with `nuqs` to keep table state (`pageIndex`, `rowPerPage`, `word`, `status`, `departmentId`, `positionId`, `cursor`) synced with URL search params.


