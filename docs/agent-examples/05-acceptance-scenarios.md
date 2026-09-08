# Example 5: Acceptance Scenarios

These scenarios specify what to test after adapting the snippets to the actual repository. They are not a report of tests already run.

## Database fixtures

In a disposable test environment, provision two tenants, Alice in tenant A, Bob in tenant B, one user belonging to both tenants, and an authenticated user with no memberships. Create at least one employee in each tenant through the authorized fixture setup.

Test using ordinary user clients and direct Data API requests. Use administrative access only for fixture setup and final inspection of protected rows. Do not run policy assertions exclusively as a database owner or service role.

| Scenario | Expected result |
| --- | --- |
| Alice lists tenant A | Only A's employees are visible |
| Alice lists tenant B | No B rows are returned |
| Alice reads B's employee by ID | No record is returned |
| Alice inserts into A | Insert succeeds |
| Alice inserts into B | Request is rejected |
| Alice updates/deletes A's employee | Exactly the intended row changes |
| Alice updates/deletes B's employee | No B row changes; returning-single service reports failure |
| Alice modifies her own membership | Request is rejected |
| Multi-tenant member changes an employee's tenant ID | Rejected by column privileges |
| Client supplies employee ID or creation time on insert | Rejected by column privileges |
| Unauthenticated client accesses employees | No employee data or write access |
| Authenticated non-member attempts CRUD | No employee data or write access |
| Blank, whitespace-only, or overlong name bypasses the form | Database constraint rejects it |
| Membership is removed, then a new request is made | Former member loses that tenant's access |

A denied update/delete may affect zero rows rather than raise a database authorization error. Assert unchanged data and the service's failure behavior, not just an expected error code.

## Service and cache behavior

- A Supabase error rejects the service call instead of returning an empty success result.
- Invalid IDs/page sizes are rejected before a request is sent.
- List queries use bounded ranges and a deterministic secondary sort.
- Detail absence is handled without revealing another tenant's records.
- Create/update return the persisted row; delete requires one returned ID.
- Cache keys differ across users, tenants, pages, and any added filters.
- If scope changes during a mutation, completion updates the submitted scope's cache.
- Failed writes do not trigger success feedback or clear the form.
- A failed refresh after a committed write is not presented as permission to blindly repeat the write.
- Logout clears sensitive cached content, and mounted feature UI cannot submit with stale scope.

## Form and UI behavior

- Create and edit render the same labeled name input.
- Validation messages appear for invalid names; the request is not sent.
- Inputs and submit control are disabled during submission.
- A rejected mutation preserves values and produces a visible form error without an unhandled rejection.
- Successful create clears the create form; successful edit resets the dirty baseline to the saved value.
- A background refetch does not erase unsaved edits.
- Changing record/user/tenant remounts the form after the app's unsaved-change policy is satisfied.
- Initial loading, initial error/retry, unavailable record, and background refresh failure display distinct states.
- Delete cancellation sends no request. Confirmation sends the scoped request once and retains the dialog on failure.
- Keyboard navigation, labels, validation associations, and pending states remain accessible.

## Monorepo integration checks

1. Apply the migration in the configured disposable database and regenerate types.
2. Compile/typecheck with the actual dependencies, package exports, client factory, and component APIs.
3. Run database policy/constraint tests, service integration tests, and relevant UI tests.
4. Check affected consumers of generated types and any shared exports.
5. Review deployment compatibility if existing apps or jobs use the same database.

## Verification status of this reference

The delivered Markdown files have been checked for internal links and code-fence structure. The snippets have not been compiled against your application or executed against Supabase because the actual repository, generated types, and test database were not supplied. Treat the scenarios above as adoption requirements and record actual results in the implementation task.
