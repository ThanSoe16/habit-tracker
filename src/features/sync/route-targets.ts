export type LegacySyncTarget = 'user' | 'gym' | 'budget' | 'goals';

/** Only dependencies of the visible route; shared profile settings are always needed. */
export function routeSyncTargets(pathname: string): LegacySyncTarget[] {
  const targets: LegacySyncTarget[] = ['user'];
  if (pathname === '/account') return targets;
  if (
    pathname.startsWith('/workout') ||
    ['/managements/plan', '/managements/edit-personal-info'].includes(pathname)
  ) {
    return [...targets, 'gym'];
  }
  if (
    pathname.startsWith('/habits') ||
    pathname.startsWith('/managements') ||
    pathname.startsWith('/generals')
  ) {
    return targets;
  }
  if (pathname.startsWith('/budget')) targets.push('budget');
  if (pathname.startsWith('/goals')) targets.push('goals');
  return targets;
}

export function budgetGroupsForRoute(
  pathname: string,
): import('../budget/services/budget-read-service').BudgetReadGroup[] | undefined {
  const base: import('../budget/services/budget-read-service').BudgetReadGroup[] = [
    'wallets',
    'settings',
  ];
  const groups: Record<string, import('../budget/services/budget-read-service').BudgetReadGroup[]> =
    {
      '/budget/savings': [],
      '/budget/relationship-funds': [],
      '/budget/expenses': [],
      '/budget/income': [],
      '/budget/exchange': [],
      '/budget/salary': [],
      '/budget/family': [],
      '/budget/loans': [],
      '/budget/gold': [],
      '/budget': [],
    };
  return pathname in groups ? [...base, ...groups[pathname]] : undefined;
}

export function gymScopeForRoute(
  pathname: string,
): 'session' | 'history' | 'metric-history' | 'settings' | 'plans' | 'profile' | undefined {
  if (pathname === '/workout/personal-info') return 'profile';
  if (
    [
      '/workout/hydration-progress',
      '/workout/weight-progress',
      '/managements/edit-personal-info',
    ].includes(pathname)
  )
    return 'settings';
  if (pathname === '/workout/today') return 'session';
  if (pathname === '/workout/history') return 'history';
  if (pathname === '/workout/personal-info-history') return 'metric-history';
  if (pathname === '/managements/plan') return 'plans';
  if (pathname.endsWith('/settings')) return 'settings';
  return undefined;
}
