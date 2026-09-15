# Relationship Funds

`/budget/relationship-funds` tracks flexible **Save money** and **Spend money**
transactions for **TSO** and **Nway**, in MMK. Each transaction has an editable
amount, person, type, money source, date, name, and optional note.

There is no automatic 300,000 contribution or monthly allowance. The fund balance
is all recorded savings minus all recorded spending, across every month. The person selector shows TSO, Nway, or both together. The three summary tiles
show saved, spent, and net totals for that selection, across every month.

## Money source

| Selection      | Save money                              | Spend money                                    |
| -------------- | --------------------------------------- | ---------------------------------------------- |
| Current budget | Adds to the fund and current MMK wallet | Subtracts from the fund and current MMK wallet |
| Extra money    | Adds to the fund only                   | Subtracts from the fund only                   |

This follows the requested Family Budget behavior: a save marked Current budget
represents money added to the wallet. It is not a transfer out of the wallet.
Home's displayed MMK Current Balance is **Available + In savings + Relationship
funds**, as requested. For example, 11,764,523 + 110,000 + 250,000 displays
12,124,523 K. The relationship amount is all-time savings minus spending for both
people, regardless of money source. This display calculation does not write or
credit the wallet. Current budget transactions retain their existing wallet effects;
the displayed combined total includes the relationship ledger separately as well.

The relationship fund is shown beneath the Available/In savings breakdown. Its
MMK amount is not added to USDT, THB, or SGD totals. MMK totals wait for both savings
and relationship data; failed reads are not silently counted as zero. The total
and breakdown share one fund query, with cached saved changes and retry states.
Relationship transactions have their own history; they do not
create duplicate entries in the personal Income/Expenses lists.

Editing a transaction reverses its previous wallet effect and applies its new
one, including changes between saving/spending or Current budget/Extra money.
Deleting reverses its wallet effect. Exact subtraction can make the wallet or
fund negative; balances are never clamped, so edits and reversals remain lossless.

TSO and Nway identify people in the signed-in account's fund. This does not grant
a second login access to the account. RLS continues to isolate accounts.

## Database rollout

Apply both relationship-fund migrations in order:

1. `20260915000001_add_relationship_funds.sql` (original expense table).
2. `20260915000002_relationship_fund_transactions.sql` (flexible transactions and wallet integration).

The second migration is incremental, including for installations that already
applied the first. It renames the table to `relationship_fund_transactions` and
preserves existing expenses as Spend / Extra money, with an unassigned person.
No person is guessed and no legacy wallet is changed. Editing a legacy transaction
requires choosing TSO or Nway. No hosted migration was applied during this work.

Owner-only CRUD policies, explicit column grants, and the auth-user foreign key
remain in force. Clients cannot change IDs, ownership, or creation timestamps.
A security-definer AFTER trigger with an empty search path applies the difference
between the old and new wallet effects. The transaction and wallet update commit
or roll back together. Clients cannot execute the trigger function directly.
Database checks validate amounts, dates, names, people, types, and money sources.

The wallet uses an atomic upsert that adds a delta to its current value. Duplicate
creates do not run the AFTER trigger. Retrying an identical edit has zero delta.
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

Writes check the existing budget sync queue before changing the server wallet.
After success, the shared transfer-refresh helper updates the local wallet without
queueing a competing write. If refresh fails, the saved transaction stays saved
and the success message asks the user to reload the current budget. Forms retain
input on write failure, disable pending controls, and protect unsaved changes;
delete confirmation remains open on failure.

The legacy budget queue writes absolute wallet snapshots. Concurrent personal
budget edits from other tabs/devices retain its existing last-write-wins limitation;
relationship-to-relationship wallet changes themselves use atomic deltas. Complete
multi-page report reads are not transactional snapshots across concurrent writes.
The legacy budget JSON backup/reset excludes this separate ledger; use database
backup tooling for relationship transactions.

## Verification

Passed against disposable local PostgreSQL 14 on port 55439, with the full
historical migration chain and the repository's Supabase auth policy harness:

- Upgrade with a pre-existing expense preserves its contents and wallet balances.
- TSO/Nway, Save/Spend, Current budget/Extra money, arbitrary positive MMK amounts.
- Create, repeat-create denial, repeated edits, type/source changes, and deletion.
- Exact negative balances, rollback after a transaction error, concurrent credits.
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
Savings transfer-refresh and settings/budget-sync regression tests also passed.
TypeScript, changed-feature ESLint, and the production build passed. The build
reported the existing metadataBase and Node warnings.

Actual type generation was attempted with `supabase gen types typescript --db-url
... --schema public`, but Docker is not running. No generated types were fabricated;
the service retains the existing captured-session client contract. Browser visual,
keyboard, form-failure, and account-switch tests remain unrun because this session
has no configured computer-use browser surface. The SQL harness does not test
hosted Auth/PostgREST behavior.
