import {
  createAccountStoreLifecycle,
  memoryAccountStore,
  persistedAccountStore,
} from './account-store-lifecycle';

export const routeStores = createAccountStoreLifecycle({
  gym: async () => memoryAccountStore((await import('@/store/use-gym-store')).useGymStore),
  budget: async () =>
    persistedAccountStore((await import('@/store/use-budget-store')).useBudgetStore, 'budget'),
  goals: async () =>
    persistedAccountStore(
      (await import('@/features/goals/store/use-goals-store')).useGoalsStore,
      'goals',
    ),
  media: async () =>
    persistedAccountStore((await import('@/store/use-media-store')).useMediaStore, 'media'),
  wellbeing: async () =>
    persistedAccountStore(
      (await import('@/store/use-digital-wellbeing-store')).useDigitalWellbeingStore,
      'digital-wellbeing',
    ),
  focus: async () =>
    persistedAccountStore(
      (await import('@/features/wellbeing/store/use-focus-session-store')).useFocusSessionStore,
      'focus-session',
    ),
});

export type RouteStoreTarget = Parameters<typeof routeStores.prepare>[0][number];
