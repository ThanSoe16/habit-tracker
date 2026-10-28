# Browser test coverage

All 65 App Router page routes have a mapped Momentic case. This is a coverage map, not a claim that every case passed. See the latest run results in `test-results/`.

Run `pnpm test:e2e --url-override http://127.0.0.1:3001/login` for the full page suite. Use `--feature habits` (or `access`, `account`, `budget`, `goals`, `media`, `mood`, `wellbeing`, `workout`, `fixtures`) for a focused run.

## Scenarios

- Every page: expected content, authentication state, and applicable records or empty state. Loading and query failures cannot satisfy the content assertions.
- Navigation: protected routes redirect signed-out visitors; legacy routes reach their current destinations; root and authentication callback behavior are checked.
- Interaction: daily habit filters, report ranges, month navigation, settings dialogs, and unsaved form inspection.
- Validation: required habit and goal names, plus the existing login empty-field and short-password checks.
- Temporary habit: create, inspect statistics/calendar, edit, reload, cancel deletion, delete, and verify absence after reload.
- Temporary goal: create with a sub-idea, inspect, edit, complete with a note, reload history, reopen, cancel deletion, delete, and verify absence after reload.

## Data and limitations

The runner uses the ordinary test-account session and exact per-run names for fallback cleanup of temporary habits and goals. It never resets account data or clears existing history. Browser session files and reports are gitignored.

Budget cases inspect filters and forms; they do not post financial transactions, pay salaries, or modify wallet balances. Media cases inspect library and capture controls; they do not test hardware capture or uploads. Mood, notification settings, focus sessions, and bedtime schedules are inspected without saving changes. Cross-account RLS enforcement is outside this UI suite.

## Verification

- YAML lint, formatting, runner syntax, and runner ESLint checks pass.
- The public suite passed all 11 tests on the local app at port 3001. Recorded
  URLs also confirm that all eight protected-route redirects preserve their
  exact destination in `next`.
- The full suite stopped in authentication setup: the Supabase token request
  failed with `ERR_CONNECTION_REFUSED`. A direct backend connection check also
  failed. This is not evidence of invalid credentials.
- The remaining 64 authenticated page and workflow cases have not executed.
  No temporary records were created. Once backend connectivity is restored,
  rerun `pnpm test:e2e --url-override http://127.0.0.1:3001/login`.

## Route map

| Page route                        | Test                                                                                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/budget/exchange`                | [budget-exchange.test](../e2e/pages/budget/budget-exchange.test.yaml)                                                                                           |
| `/budget/expenses`                | [budget-expenses.test](../e2e/pages/budget/budget-expenses.test.yaml)                                                                                           |
| `/budget/family`                  | [budget-family.test](../e2e/pages/budget/budget-family.test.yaml)                                                                                               |
| `/budget/gold`                    | [budget-gold.test](../e2e/pages/budget/budget-gold.test.yaml)                                                                                                   |
| `/budget/income`                  | [budget-income.test](../e2e/pages/budget/budget-income.test.yaml)                                                                                               |
| `/budget/loans`                   | [budget-loans.test](../e2e/pages/budget/budget-loans.test.yaml)                                                                                                 |
| `/budget`                         | [budget-overview.test](../e2e/pages/budget/budget-overview.test.yaml), [signed-out-budget.test](../e2e/pages/access/signed-out-budget.test.yaml)                |
| `/budget/relationship-funds`      | [budget-relationship-funds.test](../e2e/pages/budget/budget-relationship-funds.test.yaml)                                                                       |
| `/budget/salary`                  | [budget-salary.test](../e2e/pages/budget/budget-salary.test.yaml)                                                                                               |
| `/budget/savings`                 | [budget-savings.test](../e2e/pages/budget/budget-savings.test.yaml)                                                                                             |
| `/budget-generals/reports`        | [budget-reports.test](../e2e/pages/budget/budget-reports.test.yaml)                                                                                             |
| `/budget-generals/settings`       | [budget-settings.test](../e2e/pages/budget/budget-settings.test.yaml)                                                                                           |
| `/generals/reports`               | [habits-reports.test](../e2e/pages/habits/habits-reports.test.yaml)                                                                                             |
| `/generals/settings`              | [habits-settings.test](../e2e/pages/habits/habits-settings.test.yaml)                                                                                           |
| `/habits/history`                 | [habits-history.test](../e2e/pages/habits/habits-history.test.yaml)                                                                                             |
| `/habits/overall`                 | [habits-overall.test](../e2e/pages/habits/habits-overall.test.yaml)                                                                                             |
| `/habits/today`                   | [habits-today.test](../e2e/pages/habits/habits-today.test.yaml), [signed-out-habits.test](../e2e/pages/access/signed-out-habits.test.yaml)                      |
| `/habits/weekly`                  | [habits-weekly.test](../e2e/pages/habits/habits-weekly.test.yaml)                                                                                               |
| `/managements/[id]/edit`          | [habit-lifecycle.test](../e2e/pages/fixtures/habit-lifecycle.test.yaml)                                                                                         |
| `/managements/[id]`               | [habit-lifecycle.test](../e2e/pages/fixtures/habit-lifecycle.test.yaml)                                                                                         |
| `/managements/create`             | [habits-create-validation.test](../e2e/pages/habits/habits-create-validation.test.yaml)                                                                         |
| `/managements/one-time`           | [habits-manage-one-time.test](../e2e/pages/habits/habits-manage-one-time.test.yaml)                                                                             |
| `/managements/regular`            | [habits-manage-regular.test](../e2e/pages/habits/habits-manage-regular.test.yaml)                                                                               |
| `/mood/history`                   | [mood-history.test](../e2e/pages/mood/mood-history.test.yaml)                                                                                                   |
| `/mood`                           | [mood-calendar-alias.test](../e2e/pages/mood/mood-calendar-alias.test.yaml)                                                                                     |
| `/mood/today`                     | [mood-calendar.test](../e2e/pages/mood/mood-calendar.test.yaml), [signed-out-mood.test](../e2e/pages/access/signed-out-mood.test.yaml)                          |
| `/mood-generals/reports`          | [mood-reports.test](../e2e/pages/mood/mood-reports.test.yaml)                                                                                                   |
| `/mood-generals/settings`         | [mood-settings.test](../e2e/pages/mood/mood-settings.test.yaml)                                                                                                 |
| `/store/gallery`                  | [media-gallery.test](../e2e/pages/media/media-gallery.test.yaml)                                                                                                |
| `/store`                          | [media-library.test](../e2e/pages/media/media-library.test.yaml), [signed-out-media.test](../e2e/pages/access/signed-out-media.test.yaml)                       |
| `/store/voice`                    | [media-voice.test](../e2e/pages/media/media-voice.test.yaml)                                                                                                    |
| `/store-generals/report`          | [media-reports.test](../e2e/pages/media/media-reports.test.yaml)                                                                                                |
| `/store-generals/settings`        | [media-settings.test](../e2e/pages/media/media-settings.test.yaml)                                                                                              |
| `/managements/edit-personal-info` | [workout-edit-profile.test](../e2e/pages/workout/workout-edit-profile.test.yaml)                                                                                |
| `/managements/plan`               | [workout-plan.test](../e2e/pages/workout/workout-plan.test.yaml)                                                                                                |
| `/workout/history`                | [workout-history.test](../e2e/pages/workout/workout-history.test.yaml)                                                                                          |
| `/workout/hydration-progress`     | [workout-hydration.test](../e2e/pages/workout/workout-hydration.test.yaml)                                                                                      |
| `/workout/personal-info`          | [workout-personal-info.test](../e2e/pages/workout/workout-personal-info.test.yaml)                                                                              |
| `/workout/personal-info-history`  | [workout-body-history.test](../e2e/pages/workout/workout-body-history.test.yaml)                                                                                |
| `/workout/today`                  | [workout-today.test](../e2e/pages/workout/workout-today.test.yaml), [signed-out-workout.test](../e2e/pages/access/signed-out-workout.test.yaml)                 |
| `/workout/weight-progress`        | [workout-weight-goal.test](../e2e/pages/workout/workout-weight-goal.test.yaml)                                                                                  |
| `/workout-generals/reports`       | [workout-reports.test](../e2e/pages/workout/workout-reports.test.yaml)                                                                                          |
| `/workout-generals/settings`      | [workout-settings.test](../e2e/pages/workout/workout-settings.test.yaml)                                                                                        |
| `/account`                        | [account-settings.test](../e2e/pages/account/account-settings.test.yaml), [signed-out-account.test](../e2e/pages/access/signed-out-account.test.yaml)           |
| `/goals/create`                   | [goals-create-validation.test](../e2e/pages/goals/goals-create-validation.test.yaml)                                                                            |
| `/goals/history`                  | [goals-history.test](../e2e/pages/goals/goals-history.test.yaml)                                                                                                |
| `/goals/manage`                   | [goals-list.test](../e2e/pages/goals/goals-list.test.yaml)                                                                                                      |
| `/goals`                          | [goals-home.test](../e2e/pages/goals/goals-home.test.yaml), [signed-out-goals.test](../e2e/pages/access/signed-out-goals.test.yaml)                             |
| `/goals/settings`                 | [goals-settings.test](../e2e/pages/goals/goals-settings.test.yaml)                                                                                              |
| `/wellbeing`                      | [redirect-wellbeing.test](../e2e/pages/wellbeing/redirect-wellbeing.test.yaml)                                                                                  |
| `/wellbeing/progress`             | [redirect-wellbeing-progress.test](../e2e/pages/wellbeing/redirect-wellbeing-progress.test.yaml)                                                                |
| `/wellbeing/session`              | [redirect-wellbeing-session.test](../e2e/pages/wellbeing/redirect-wellbeing-session.test.yaml)                                                                  |
| `/wellbeing/settings`             | [redirect-wellbeing-settings.test](../e2e/pages/wellbeing/redirect-wellbeing-settings.test.yaml)                                                                |
| `/auth/callback`                  | [auth-callback-no-session.test](../e2e/pages/access/auth-callback-no-session.test.yaml)                                                                         |
| `/auth/login`                     | [auth-login-alias.test](../e2e/pages/access/auth-login-alias.test.yaml)                                                                                         |
| `/digital-wellbeing/app-limits`   | [wellbeing-app-limits.test](../e2e/pages/wellbeing/wellbeing-app-limits.test.yaml)                                                                              |
| `/digital-wellbeing/app-usage`    | [wellbeing-app-usage.test](../e2e/pages/wellbeing/wellbeing-app-usage.test.yaml)                                                                                |
| `/digital-wellbeing/bedtime`      | [wellbeing-bedtime.test](../e2e/pages/wellbeing/wellbeing-bedtime.test.yaml)                                                                                    |
| `/digital-wellbeing/challenges`   | [wellbeing-challenges.test](../e2e/pages/wellbeing/wellbeing-challenges.test.yaml)                                                                              |
| `/digital-wellbeing/focus`        | [wellbeing-focus.test](../e2e/pages/wellbeing/wellbeing-focus.test.yaml)                                                                                        |
| `/digital-wellbeing/insights`     | [wellbeing-insights.test](../e2e/pages/wellbeing/wellbeing-insights.test.yaml)                                                                                  |
| `/digital-wellbeing`              | [wellbeing-overview.test](../e2e/pages/wellbeing/wellbeing-overview.test.yaml), [signed-out-wellbeing.test](../e2e/pages/access/signed-out-wellbeing.test.yaml) |
| `/digital-wellbeing/settings`     | [wellbeing-settings.test](../e2e/pages/wellbeing/wellbeing-settings.test.yaml)                                                                                  |
| `/login`                          | [login-validation.test](../login-validation.test.yaml), [login-success.test](../login-success.test.yaml)                                                        |
| `/`                               | [root-redirect.test](../e2e/pages/access/root-redirect.test.yaml)                                                                                               |
