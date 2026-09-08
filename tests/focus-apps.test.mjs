import assert from 'node:assert/strict';
import test from 'node:test';
import { getFocusApps } from '../src/features/wellbeing/utils/get-focus-apps.ts';

function usage(appIdentifier, appName) {
  return {
    id: appIdentifier,
    appIdentifier,
    appName,
    icon: appName[0],
    iconUrl: null,
    category: 'Social',
    durationSeconds: 60,
    percentage: 100,
    openCount: 1,
    notifications: 0,
  };
}

function limit(appIdentifier, appName, enabled = true) {
  return {
    id: `limit-${appIdentifier}`,
    appIdentifier,
    appName,
    icon: appName[0],
    dailyLimitSeconds: 3600,
    usedTodaySeconds: 0,
    warningBeforeSeconds: 300,
    enabled,
  };
}

test('an app created in App Limits appears without any usage history', () => {
  assert.deepEqual(getFocusApps([], [limit('custom:facebook', 'Facebook')]), [
    {
      id: 'custom:facebook',
      appIdentifier: 'custom:facebook',
      appName: 'Facebook',
      category: 'Other',
      iconUrl: null,
    },
  ]);
});

test('apps shared by usage and limits appear once with their usage metadata', () => {
  const app = { ...usage('com.instagram.android', 'Instagram'), iconUrl: '/instagram.png' };
  assert.deepEqual(getFocusApps([app], [limit(app.appIdentifier, app.appName)]), [app]);
});

test('all usage apps and new custom apps remain available beyond the old five-app cutoff', () => {
  const apps = Array.from({ length: 6 }, (_, index) => usage(`app-${index}`, `App ${index}`));
  const result = getFocusApps(apps, [limit('custom:game', 'My Game')]);
  assert.equal(result.length, 7);
  assert.deepEqual(result.slice(0, 6), apps);
  assert.equal(result[6].appName, 'My Game');
});

test('turning off a daily limit does not remove the app from Focus Mode', () => {
  assert.equal(getFocusApps([], [limit('custom:game', 'My Game', false)])[0].appName, 'My Game');
});

test('empty sources stay empty and repeated saved app identifiers are deduplicated', () => {
  assert.deepEqual(getFocusApps([], []), []);
  const app = limit('custom:facebook', 'Facebook');
  assert.equal(getFocusApps([], [app, app]).length, 1);
});
