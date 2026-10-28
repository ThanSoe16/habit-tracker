This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Project coding rules start in [AGENTS.md](AGENTS.md). The supplied reference examples
are in [docs/agent-examples](docs/agent-examples/README.md); see the
[adoption review](docs/rules-adoption.md) for integration gaps and verification.

See [account ownership and rollout](docs/account-ownership.md) before deploying the
account-based version or inviting other people.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Login tests with Momentic

Start the app with `pnpm dev`, then run `pnpm test:login`. This checks the login
page, empty-field validation, short-password validation, and retained form input.
It does not require a user account or submit valid credentials to Supabase.

For successful sign-in coverage, configure an existing dedicated test account in
the gitignored `.env.local` file alongside the app's Supabase settings:

```dotenv
E2E_LOGIN_EMAIL=your-test-account@example.com
E2E_LOGIN_PASSWORD=your-test-account-password
```

Run `pnpm test:login:success` to sign in, verify `/habits/today`, and check that the
session survives a reload. This test establishes a real session; use a test account
in your intended Supabase environment. It does not create an account.

Both tests default to `http://localhost:3000/login`. If that port is occupied:

```bash
pnpm dev --hostname 127.0.0.1 --port 3001
# In another terminal:
pnpm test:login --url-override http://127.0.0.1:3001/login
pnpm test:login:success --url-override http://127.0.0.1:3001/login
```

Use `pnpm test:e2e:lint` to validate the YAML and `pnpm test:e2e:ui` to open the
Momentic editor. The existing `web/add-to-cart.test.yaml` uses Momentic's demo
environment and is excluded from the login commands. Generated reports and
session artifacts are gitignored.

## All-page browser tests

The [coverage map](docs/e2e-coverage.md) lists cases for all 65 page routes,
including redirects, missing habits, filters, reports, settings dialogs, and
form validation. Temporary habit and goal workflows also cover create, detail,
edit, persistence, deletion cancellation, and deletion.

With the app running and the test-account credentials configured, run:

```bash
pnpm test:e2e --url-override http://127.0.0.1:3001/login
# Run one feature:
pnpm test:e2e --feature budget --url-override http://127.0.0.1:3001/login
# Run without signing in:
pnpm test:e2e:public --url-override http://127.0.0.1:3001/login
```

Omit the URL override when the app runs on the default port 3000. Supported
features are `access`, `account`, `budget`, `goals`, `habits`, `media`, `mood`,
`wellbeing`, `workout`, and `fixtures`. The runner signs in once and then runs
independent cases with one browser worker. Use `--parallel 2` when the machine has
enough spare capacity.
Supabase must be reachable for authentication and page-data assertions.

The `fixtures` cases create uniquely named temporary habits and goals. The runner
verifies cleanup using the ordinary account session and only this run's exact
record names, including when a browser case fails. Financial transactions,
existing records, device capture, and bulk reset controls are not submitted.

The saved browser session in `e2e/.auth/` is private and gitignored. For individual
page debugging, run `pnpm test:e2e:auth` with the same URL override first, then
select a case in the Momentic editor or run a specific file with the CLI:

```bash
pnpm exec momentic run e2e/pages/budget/budget-income.test.yaml --url-override http://127.0.0.1:3001/login
```

`pnpm test:e2e:pages` reruns all non-fixture page cases using the saved session.
Run fixture cases through `pnpm test:e2e --feature fixtures` so fallback cleanup
is available. If a process is forcibly killed, inspect `e2e/.auth/last-run.json`
for the fixture run ID; remove `e2e/.auth/run.lock` only after confirming that no
suite is running.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
