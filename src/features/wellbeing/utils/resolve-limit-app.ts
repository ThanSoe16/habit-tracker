import { CUSTOM_APP_OPTION, type AppLimitFormValues } from '../types/app-limit-form';

type LimitApp = { appIdentifier: string; appName: string };
type ResolvedApp =
  | { app: LimitApp; error?: never }
  | { app?: never; error: { field: 'appIdentifier' | 'customAppName'; message: string } };

function normalizeAppName(name: string) {
  return name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function resolveLimitApp(
  values: AppLimitFormValues,
  availableApps: LimitApp[],
  limits: LimitApp[],
): ResolvedApp {
  const custom = values.appIdentifier === CUSTOM_APP_OPTION;
  const name = normalizeAppName(values.customAppName);
  if (custom && !name) {
    return { error: { field: 'customAppName', message: 'Enter an app name.' } };
  }
  const app = custom
    ? (availableApps.find((candidate) => normalizeAppName(candidate.appName) === name) ?? {
        appIdentifier: `custom:${name}`,
        appName: values.customAppName.trim().replace(/\s+/g, ' '),
      })
    : availableApps.find((candidate) => candidate.appIdentifier === values.appIdentifier);
  if (!app) {
    return { error: { field: 'appIdentifier', message: 'Choose an available app.' } };
  }
  if (
    limits.some(
      (limit) =>
        limit.appIdentifier === app.appIdentifier ||
        normalizeAppName(limit.appName) === normalizeAppName(app.appName),
    )
  ) {
    return {
      error: {
        field: custom ? 'customAppName' : 'appIdentifier',
        message: 'This app already has a limit. Edit its existing limit instead.',
      },
    };
  }
  return { app };
}
