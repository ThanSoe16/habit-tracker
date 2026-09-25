---
trigger: always_on
---

# Acceptance and verification

Verify the behavior affected by the change using the scenarios below. Keep checks
proportional to the change and use the receiving project's existing tools. These
are acceptance requirements and example test cases, not evidence of tests run.

## Database changes

Use synthetic fixtures in a disposable database with ordinary user/anonymous
clients. Admin access is for setup/inspection, not the policy assertions. Cover
allowed CRUD, cross-owner denial, anonymous/non-member denial, protected column
changes, constraints bypassing forms, and loss of access after membership removal
where the real model supports membership. Verify unchanged protected rows even
when a denied write returns zero rows instead of an authorization error.

Regenerate actual database types and typecheck consumers after schema changes.
Record database environment, commands, results, and any unrun cases. Review legacy
clients/jobs and data backfills before deployment. Never claim mocked service tests
prove RLS enforcement or that checked-in policies match a live deployment.

## Services and UI

Test behavior relevant to the change: rejection on failed/incomplete reads or
writes, missing detail, input validation before requests, bounded deterministic
lists, returned persisted writes, zero-row delete failure, cache isolation, scope
changes during mutations, and cache clearing on logout.

For form changes verify shared fields, validation, pending controls, retained input
on rejection, correct success/reset behavior, background refresh preserving dirty
values, and scope remounting. Check loading/error/retry/unavailable states and delete
cancel/confirm/failure/page-boundary behavior. Verify labels and keyboard access.

## Example: database acceptance matrix

For a personal-item feature, provision two synthetic users, Alice and Bob, and an
item owned by each. Use their ordinary authenticated clients and a signed-out
client for requests. The names and records are fixtures, not production data.

| Scenario | Expected result |
| --- | --- |
| Alice lists or reads her own items | Only authorized records are returned |
| Alice reads Bob's item by ID | Bob's record is not exposed |
| Alice creates an item for herself | The saved row is returned with its real ID |
| Alice creates an item under Bob's identity | The request is rejected |
| Alice updates or deletes her own item | Exactly the intended row changes |
| Alice updates or deletes Bob's item | Bob's row remains unchanged; the single-row service reports failure |
| Alice changes protected ownership, ID, or creation fields | The request is rejected and protected values remain unchanged |
| A signed-out client attempts CRUD | No protected records are disclosed or changed |
| Invalid names or foreign keys bypass the form | Database constraints reject the request |
| A request fails or a page is truncated | The service reports failure, not an empty or incomplete success |

For a shared tenant/organization model, also include a non-member, a member of
multiple scopes, and each relevant role. Verify membership cannot be self-granted,
records cannot move between scopes through protected fields, and removing access
blocks subsequent requests. Verify privileges and policies together.

## Example: service, cache, and state scenarios

Implement these cases with the existing test runner and fixtures. Use controlled
promises or request interception for pending/race scenarios instead of arbitrary
sleep durations. Mocked requests can verify client behavior; use the real disposable
database to verify authorization and constraints.

```gherkin
Feature: Scoped item requests

  Scenario: Invalid input is rejected before a request
    Given the item service accepts a non-empty name
    When a caller submits a whitespace-only name
    Then validation fails
    And no database request is sent

  Scenario: A failed read is not an empty result
    Given the item request returns a backend error
    When the list is loaded
    Then the query enters an error state
    And the UI offers retry instead of showing an empty list

  Scenario: A mutation finishes after the selected scope changes
    Given an update was submitted for scope A
    And the update request is still pending
    When the user selects scope B
    And the update for scope A succeeds
    Then cache updates use the submitted scope A
    And scope B's data is unchanged

  Scenario: A stale read finishes after logout
    Given a read is pending for Alice
    When Alice signs out
    And Bob signs in
    And Alice's old read completes
    Then Alice's records are not rendered in Bob's session
    And Alice's stale form cannot submit

  Scenario: Refresh fails after a successful write
    Given the item was saved successfully
    When the subsequent list refresh fails
    Then the UI distinguishes the saved item from the failed refresh
    And retrying the refresh does not repeat the write
```

Also verify cache keys vary with every result-changing input, list ordering and
bounds, cancellation, returned saved values, and zero-row write handling. For
Zustand changes, verify immutable updates, reset preserving actions, persisted-state
migrations, hydration failure, account separation, and pending save/retry behavior.
Preserve newer local edits when an older remote response arrives.

## Example: form and deletion scenarios

```gherkin
Feature: Shared create and edit forms

  Scenario: A failed save retains user input
    Given the user has entered a valid name
    When the form is submitted
    Then inputs and the submit button are disabled while saving
    When the save fails
    Then the entered name remains in the form
    And a sanitized error is visible
    And the form can be submitted again
    And no success notification or navigation occurs

  Scenario: A background refresh preserves unsaved edits
    Given the edit form contains an unsaved name
    When a background query returns a newer record
    Then the unsaved name remains unchanged

  Scenario: Create and edit complete successfully
    Given create and edit use the same labeled field component
    When a create succeeds
    Then the create form resets to its defaults
    When an edit succeeds
    Then the edit form resets its dirty baseline to the persisted values
    And each successful submission produces one success notification

  Scenario: Delete is cancelled
    Given a delete confirmation dialog is open
    When the user cancels
    Then no delete request is sent

  Scenario: Delete fails and can be retried
    Given a delete confirmation dialog is open
    When the user confirms deletion
    Then one scoped delete request is sent
    And repeat confirmation is disabled while pending
    When the request fails
    Then the dialog remains open with an error
    And the record remains available for retry
```

Check initial loading, retry, unavailable records, and background refresh separately.
Verify deleting the final row of a page leaves accessible pagination. Apply the
unsaved-changes policy before switching records or ownership scope. Check keyboard
navigation, accessible names, field/error associations, focus behavior, and relevant
responsive layouts. Gherkin here describes behavior; it does not require installing
a Gherkin runner.

## Commands and scope of verification

Inspect `package.json`, the lockfile, and existing test configuration first. Use
the installed package manager and actual scripts. For a pnpm-based TypeScript
project, the following are example commands; replace paths with changed files:

```sh
pnpm exec tsc --noEmit --incremental false
pnpm exec eslint src/features/items/services/api.ts
```

- Run the configured focused tests for the changed feature, including existing
  synchronization/save-queue coverage when affected.
- Run policy/constraint tests against the configured disposable database for
  database changes. Generate types after applying the intended migrations there.
- Run the configured production build when route, provider, or client/server
  integration changes warrant it.
- Reuse the existing test runner and TypeScript loader; do not install a new runner
  for a small regression or assume another project's test script exists.
- For documentation-only changes, check formatting, code fences, and any links.
  Check inline examples when feasible and name missing prerequisites explicitly.
- Stop after appropriate checks pass unless a new change or unresolved concern
  warrants more testing. Do not add tests that merely repeat implementation details.

## Example: verification report

Report actual results using this structure. Replace placeholders with evidence;
leave checks explicitly unrun when their environment or prerequisites are absent.

```text
Changed behavior: <what the user can now do or what failure was corrected>
Environment: <local/disposable database, runtime, and relevant dependency versions>
Checks executed: <exact commands and pass/fail results>
Behavior verified: <relevant acceptance scenarios covered by those checks>
Not run: <missing checks, prerequisites, and resulting limits>
Pre-existing failures: <failures established as unrelated to this change>
```

Do not claim full compliance based only on a typecheck, infer database policy
enforcement from mocks, or report planned checks as completed. A syntax-only check
does not prove generated-type compatibility or runtime behavior.
