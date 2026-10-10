# Native iOS Goals App

The first native app includes Goals, settings, history, and email/password sign-in.
It reuses the existing goal screens and Supabase services. Other app features remain
in the web app and have not been migrated to SQLite.

## Development

Install dependencies with `pnpm install`. The native scripts read the repository's
existing `.env.local` through Next's environment loader. Set
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` there, as for
the web app. Never put a service-role key in the app.

```sh
pnpm dev:native
```

For the desktop Tauri app, run:

```sh
pnpm tauri dev
```

Tauri starts the native preview automatically. When this project's preview is
already running on port 1420, the launcher reuses it. If another app occupies that
port, the launcher reports the conflict without stopping that app.

To create the bundled frontend:

```sh
pnpm build:native
```

The browser preview opens at `http://localhost:1420`. It uses localStorage to
preview the same manual sync flow. Installed Tauri apps use native SQLite through
the SQL plugin. The native build outputs bundled static screens to `native/out`;
it does not register a service worker or require the hosted Next server to open.

The normal `pnpm dev` and `pnpm build` commands still build the web app.

## iOS

Install full Xcode, select its developer directory, complete its first launch,
and install the iOS simulator/runtime. Apple Command Line Tools alone cannot build
the iOS app. Install the Rust iOS targets documented by Tauri.

```sh
pnpm ios:init
pnpm ios:dev
pnpm ios:build
```

Before signing or distributing, set your own bundle identifier and Apple development
team in `src-tauri/tauri.conf.json`. The checked-in identifier is a development
placeholder. Generated Xcode files live in `src-tauri/gen` and are ignored.
Icons were generated from the existing Habit Tracker icon.

The initial native sign-in uses the existing Supabase email/password flow and needs
internet. Native OAuth, magic-link redirects, push notifications, and App Store
distribution are not configured by this change.

## Offline And Sync Behavior

After signing in, the app can reopen the last account's local goals offline. The
last-account marker contains only a user ID; credentials remain in the existing
Supabase auth storage. Cloud operations always require a valid Supabase session
and use the existing owner-scoped services and database policies.

Edits save to `habit-tracker.db` in the app's private data directory. SQLite's
`local_state` table stores a JSON snapshot under an account-specific key. The
snapshot contains goals, settings, the last confirmed cloud snapshot, and the last
successful sync time. Saving current data and the baseline in one row makes the
outbox atomic: differences from the baseline represent pending creates, updates,
and deletions, including after a restart. No auth credentials are stored in this
SQLite table. Unassigned web-app storage is not automatically imported.

The Sync button verifies the session, uploads pending changes, then downloads a
complete cloud snapshot. App launch, reconnecting, and edits do not start cloud
sync. Device writes finish before sync begins. Failed writes stay pending, and
failed device saves display a separate retry control. Avoid closing the app while
the device-save indicator is still pending.

Pending local changes take priority over cloud changes to the same goal when Sync
is pressed. Goals unchanged locally take the cloud version. Settings use the same
policy; savings and sub-ideas are part of their parent goal. This is suitable for
one main editing device, but does not merge concurrent edits within one goal across
devices. New edits and deletions made while a sync is running remain pending for
the next click. Deletes are replayable through the existing idempotent service.

The baseline advances only after a complete successful sync. If a connection fails
after a cloud write commits, retries can repeat that write; saves use stable IDs
and deletes accept already-missing records. Signing out clears active memory and
the last-account marker while preserving each account's saved snapshot and outbox.

For a custom Supabase domain, update the native content security policy's
`connect-src` allowlist to match that domain.

## Verification

```sh
pnpm test:native
node --import ./tests/register-typescript.mjs --test tests/goals-sync.test.mjs tests/account-isolation.test.mjs
pnpm exec tsc --noEmit --incremental false
pnpm build:native
cargo check --manifest-path src-tauri/Cargo.toml
```

Native tests exercise SQLite schema integrity, account isolation, persistence and
retry behavior, failure recovery, and edits during sync. They use synthetic records
and mocked cloud services; they do not prove hosted RLS or iOS plugin behavior.
On an iOS simulator/device, verify sign-in, a first Sync, airplane-mode edits,
force-close/reopen, reconnecting without automatic sync, and a button-triggered
upload/download against a disposable Supabase account.

References: [Tauri Next.js setup](https://v2.tauri.app/start/frontend/nextjs/),
[SQL plugin](https://v2.tauri.app/plugin/sql/), and
[iOS prerequisites](https://v2.tauri.app/start/prerequisites/).
