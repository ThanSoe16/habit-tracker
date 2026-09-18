# Savings

`/budget/savings` tracks money held aside, including deposits received from someone
such as Mom. Home's **Current Balance** is the spendable wallet balance plus all
savings balances in the selected currency, plus the relationship fund balance when
MMK is selected (see [Relationship Funds](relationship-funds.md)). Deposits increase that total immediately;
existing savings are included too. Deposits never increase Available. The Available/In savings breakdown distinguishes
spendable money from money still held aside. A saving has a currency and
at least one withdrawal condition: a target amount or a UTC unlock date. With both
conditions, the user chooses either/OR or both/AND. Reaching the target is recorded
permanently, so partial withdrawals do not lock the pot again.

Withdrawals reduce savings and Home's combined total without adding to Available
or creating an Income entry. The application always submits `to_budget: false`
and rejects requests to credit the wallet. The database atomically deducts savings
and records history using its existing outside-budget withdrawal path.
Deposits represent money
received directly for saving; moving existing wallet funds into savings is not part
of this flow. The UI explains this distinction.

Rules and currency are fixed at creation. The savings ledger is append-only through
the ordinary-user API. No edit/delete controls or early-unlock override are provided.
Savings data lives in its own account-scoped Query flow, separate from the legacy
budget store's retry queue. Lists and history use deterministic pages of 10, exact
counts, and explicit columns. The existing budget JSON export/reset does not include
or erase savings; back up these tables through normal database backup tooling.

## Database rollout

Apply `supabase/migrations/20260915000000_add_savings.sql` after the existing account
ownership migrations, before using this feature. In the linked project's authenticated
terminal, the normal migration command is:

```sh
supabase db push --linked
```

No hosted migration was applied during implementation. The two new tables have
owner-only SELECT policies; authenticated users have no direct write grants. The
security-definer functions use an empty search path, explicitly verify auth.uid(),
and never accept an owner ID. Row locks serialize each saving's deposits/withdrawals.
Stable request UUIDs make identical retries idempotent. A reused UUID with different
details is rejected. Currency, amounts, precision, notes, and withdrawal conditions
are constrained independently of the forms.

Historical budget withdrawals and their wallet/income entries remain unchanged.
The database retains its legacy transfer option for compatibility, but the current
application no longer offers or submits it. Savings withdrawals do not wait for or
refresh the budget store. Savings balances/history themselves are serialized.

Home's combined balance is a read-only presentation of the existing balances;
this change needs no additional migration or backfill and never credits savings a
second time. Savings totals use complete bounded reads across every savings page,
scoped to the signed-in account, with errors shown instead of silently assuming zero.
Successful transactions replace the cached saved balance, including the Home summary.

## Verification

The complete historical migration chain and new migration passed on disposable local
PostgreSQL 14 with the repository's minimal Supabase auth/storage policy harness.
Assertions run with authenticated/anon roles, rather than administrative clients:

- Own reads, creation, deposit, and withdrawal; cross-owner and anonymous denial.
- Direct balance, ownership, rule, and ledger tampering denied with rows unchanged.
- Deposits excluded from wallets; atomic withdrawal/wallet/income updates.
- Target, date, OR, AND, UTC date boundary, permanent target achievement.
- Nonpositive/overdrawn/nonfinite/excess-precision amounts and invalid rules rejected.
- Duplicate request protection and two concurrent withdrawals unable to overdraw.

To repeat on an **empty disposable local** database named `habit_account_*`:

```sh
ACCOUNT_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/habit_account_savings \
  node tests/run-savings-database-tests.mjs
node --import ./tests/register-typescript.mjs --test tests/savings.test.mjs
pnpm test:settings
pnpm test:data-access
pnpm exec tsc --noEmit --incremental false
pnpm build
```

Focused Node tests cover input validation, UTC unlock logic, cache-key isolation,
bounded reads, incomplete/error results, persisted writes, sanitized errors, and
session mismatch. Home balance regression tests include existing savings, deposits,
withdrawals without wallet credits, rejection of transfer requests, currency
separation, and totals spanning more than 500 savings records. They do not substitute
for real database authorization tests.

Database type generation was attempted against the migrated disposable database with
`supabase gen types typescript --db-url ... --schema public`. It requires Docker,
which is not running. No generated types were fabricated; the service uses the
existing captured-session client until actual generation is available.

The production build passed with existing metadataBase and Node warnings. Browser
visual/keyboard/form-failure checks could not run: computer-use reported no configured
browser surface. Hosted Auth/PostgREST behavior and authenticated account-switch UI
testing remain rollout checks. No synthetic fixture data was sent to a hosted project.
