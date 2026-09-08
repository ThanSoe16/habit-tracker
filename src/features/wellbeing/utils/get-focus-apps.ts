import type { AppLimit, AppUsage } from '../types';

type FocusApp = Pick<AppUsage, 'id' | 'appIdentifier' | 'appName' | 'category' | 'iconUrl'>;

/** Include saved apps even when they have no usage in the current reporting period. */
export function getFocusApps(appUsage: AppUsage[], appLimits: AppLimit[]): FocusApp[] {
  const apps = new Map<string, FocusApp>(appUsage.map((app) => [app.appIdentifier, app]));

  for (const limit of appLimits) {
    if (apps.has(limit.appIdentifier)) continue;
    apps.set(limit.appIdentifier, {
      id: limit.appIdentifier,
      appIdentifier: limit.appIdentifier,
      appName: limit.appName,
      category: 'Other',
      iconUrl: null,
    });
  }

  return [...apps.values()];
}
