import assert from 'node:assert/strict';
import test from 'node:test';
import {
  appLimitFormSchema,
  CUSTOM_APP_OPTION,
} from '../src/features/wellbeing/types/app-limit-form.ts';
import { resolveLimitApp } from '../src/features/wellbeing/utils/resolve-limit-app.ts';

const values = {
  appIdentifier: CUSTOM_APP_OPTION,
  customAppName: 'Facebook',
  dailyLimitSeconds: 3600,
  warningBeforeSeconds: 300,
};

test('custom apps can be created without usage history', () => {
  const parsed = appLimitFormSchema.parse({ ...values, customAppName: ' Facebook ' });
  assert.deepEqual(resolveLimitApp(parsed, [], []), {
    app: { appIdentifier: 'custom:facebook', appName: 'Facebook' },
  });
});

test('custom names are required and bounded; known apps need no custom name', () => {
  for (const customAppName of ['', '   ', 'a'.repeat(81)]) {
    assert.equal(appLimitFormSchema.safeParse({ ...values, customAppName }).success, false);
  }
  assert.equal(
    appLimitFormSchema.safeParse({ ...values, appIdentifier: 'com.app', customAppName: '' })
      .success,
    true,
  );
});

test('names reuse a known app identifier instead of creating a disconnected duplicate', () => {
  const app = { appIdentifier: 'com.android.chrome', appName: 'Chrome' };
  assert.deepEqual(resolveLimitApp({ ...values, customAppName: ' CHROME ' }, [app], []), { app });
});

test('existing limits are rejected by identifier and normalized name', () => {
  const app = { appIdentifier: 'com.zhiliaoapp.musically', appName: 'TikTok' };
  const custom = resolveLimitApp({ ...values, customAppName: ' tiktok ' }, [], [app]);
  assert.equal(custom.error.field, 'customAppName');
  assert.match(custom.error.message, /already has a limit/);
  const selected = resolveLimitApp({ ...values, appIdentifier: app.appIdentifier }, [app], [app]);
  assert.equal(selected.error.field, 'appIdentifier');
});

test('custom identifiers support games, punctuation, and non-Latin names without collisions', () => {
  const names = ['My Game', 'My-Game', '遊戲'];
  const ids = names.map(
    (customAppName) => resolveLimitApp({ ...values, customAppName }, [], []).app.appIdentifier,
  );
  assert.equal(new Set(ids).size, names.length);
  assert.equal(
    resolveLimitApp({ ...values, customAppName: ' MY   GAME ' }, [], []).app.appIdentifier,
    ids[0],
  );
});

test('a removed app selection is rejected rather than silently creating a custom app', () => {
  const result = resolveLimitApp({ ...values, appIdentifier: 'missing-app' }, [], []);
  assert.equal(result.error.field, 'appIdentifier');
});
