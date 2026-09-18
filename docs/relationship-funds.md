# Relationship Funds

`/budget/relationship-funds` tracks flexible **Save money** and **Spend money**
transactions for **TSO** and **Nway**, in MMK. Each transaction has an editable
amount, person, type, date, name, and optional note.

There is no automatic 300,000 contribution or monthly allowance. The fund balance
is all recorded savings minus all recorded spending, across every month. The person selector shows TSO, Nway, or both together. The three summary tiles
show saved, spent, and net totals for that selection, across every month.

## Separate balance

Saving adds to the relationship fund; spending subtracts from it. Creating,
editing, and deleting fund transactions never change Available. The money-source
selector has been removed. Existing source values remain historical metadata only.

Home's displayed MMK Current Balance is **Available + In savings + Relationship
funds**, as requested. For example, 11,764,523 + 110,000 + 250,000 displays
12,124,523 K. The relationship amount is all-time savings minus spending for both
people, regardless of money source. This display calculation does not write or
credit the wallet. A 100,000 K fund deposit increases the total by 100,000 K once.

The relationship fund is shown beneath the Available/In savings breakdown. Its
MMK amount is not added to USDT, THB, or SGD totals. MMK totals wait for both savings
and relationship data; failed reads are not silently counted as zero. The total
and breakdown share one fund query, with cached saved changes and retry states.
Relationship transactions have their own history; they do not
create duplicate entries in the personal Income/Expenses lists.

Editing or deleting a transaction recalculates the fund total only. Fund balances
can be negative; no clamping is applied. Historical wallet credits/debits are not
retroactively reversed by this change.

TSO and Nway identify people in the signed-in account's fund. This does not grant
a second login access to the account. RLS continues to isolate accounts.

## Database rollout

Apply the relationship-fund migrations in order:

1. `20260915000001_add_relationship_funds.sql` (original expense table).
2. `20260915000002_relationship_fund_transactions.sql` (original flexible transactions).
3. `20260918000000_separate_relationship_funds.sql` (removes wallet integration).

Apply the third migration before using the updated app. It removes the wallet
trigger, preserves existing balances and ledger rows, and retains person and
ownership validation in a separate trigger. Old clients submitting either source
value also stop affecting Available. No hosted migration was applied.

The second migration is incremental, including for installations that already
applied the first. It renames the table to `relationship_fund_transactions` and
preserves existing expenses as Spend / Extra money, with an unassigned person.
No person is guessed and no legacy wallet is changed. Editing a legacy transaction
requires choosing TSO or Nway. No hosted migration was applied during this work.

Owner-only CRUD policies, explicit column grants, and the auth-user foreign key
remain in force. Clients cannot change IDs, ownership, or creation timestamps.
A validation-only BEFORE trigger with an empty search path requires a person on
new or edited rows and rejects ownership changes. Clients cannot execute it directly.
Database checks continue to validate amounts, dates, names, people, types, and
legacy money-source values. No trigger writes to current_budget.

An identical create retry returns the saved row; changed details require review.
Delete requires a returned row and does not report a missing row as successful.

## Client synchronization

The page uses Radix layout components with explicit Tailwind flex/grid, alignment,
and spacing classes. The app does not load the Radix Themes layout stylesheet;
layout props alone do not create the three-column totals or horizontal headers.

The account-scoped TanStack Query flow owns relationship transactions. Queries
read complete monthly and all-time reports in bounded requests of at most 500
rows, with exact counts and date/ID ordering. History displays 10 compact rows per page,
with person/page in URL state and page clamping after deletes. Export Statement
uses all records for the selected person, including records beyond the visible page. Persisted rows update
both monthly and all-time caches before refresh. Failed refreshes preserve loaded
results and show retry controls.

Fund writes no longer wait for the budget sync queue or refresh the wallet. Forms
retain input on failure, disable pending controls, and protect unsaved changes;
delete confirmation remains open on failure. Complete multi-page report reads are
not transactional snapshots across concurrent writes.
The legacy budget JSON backup/reset excludes this separate ledger; use database
backup tooling for relationship transactions.

## Verification

Passed against disposable local PostgreSQL 14 on port 55439, with the full
historical migration chain and the repository's Supabase auth policy harness:

- Upgrade with a pre-existing expense preserves its contents and wallet balances.
- TSO/Nway, Save/Spend, Current budget/Extra money, arbitrary positive MMK amounts.
- Create, repeat-create denial, repeated edits, type/source changes, and deletion.
- Available unchanged for create/edit/delete/retries, rollback, and concurrent fund writes.
- Separation migration preserves existing wallet balances and historical source metadata.
- Owner CRUD, cross-account/anonymous denial, protected fields and invalid payloads.
- Account deletion cascade and separate personal transaction history.

Repeat on an **empty disposable local** database named `habit_account_*`:

```sh
ACCOUNT_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/habit_account_funds \
  node tests/run-relationship-funds-database-tests.mjs
node --import ./tests/register-typescript.mjs --test tests/relationship-funds.test.mjs tests/savings.test.mjs
pnpm test:settings
pnpm exec tsc --noEmit --incremental false
pnpm build
```

Focused tests cover flexible totals, all choices, leap years, more than 500 records,
monthly/all-time queries, input validation, incomplete reads, returned writes,
sanitized errors, duplicate-create recovery, and account/month cache isolation.
Savings and settings/budget-sync regression tests also passed (30 Node tests total).
TypeScript and changed-feature ESLint passed. A production build and browser checks
were not rerun for the separation change.

During the original implementation, type generation was attempted with `supabase gen types typescript --db-url
... --schema public`, but Docker is not running. No generated types were fabricated;
the service retains the existing captured-session client contract. Browser visual,
keyboard, form-failure, and account-switch tests remain unrun because this session
has no configured computer-use browser surface. The SQL harness does not test
hosted Auth/PostgREST behavior. The separation migration changes triggers only;
table columns and application service types are unchanged.
