/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry } from '@serwist/precaching';
import { installSerwist } from '@serwist/sw';
import { pushNotificationPayloadSchema } from '@/features/habits/types/push';

declare global {
  interface ServiceWorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/rest/v1/') ||
        url.pathname.startsWith('/storage/v1/') ||
        url.pathname.startsWith('/auth/v1/'),
      handler: ({ request }) => fetch(request),
    },
    ...defaultCache,
  ],
});

// Remove historical API/media cache entries created before account isolation.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (names) => {
      await Promise.all(
        names.map(async (name) => {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          await Promise.all(
            requests
              .filter((request) => {
                const path = new URL(request.url).pathname;
                return (
                  path.startsWith('/rest/v1/') ||
                  path.startsWith('/storage/v1/') ||
                  path.startsWith('/auth/v1/')
                );
              })
              .map((request) => cache.delete(request)),
          );
        }),
      );
    }),
  );
});

const accountCacheName = 'habit-active-account';
const accountCacheKey = new URL('/__active-account', self.location.origin).href;
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'ACCOUNT_CHANGED') return;
  const userId = typeof event.data.userId === 'string' ? event.data.userId : null;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(accountCacheName);
      await cache.put(accountCacheKey, new Response(JSON.stringify({ userId })));
      const notifications = await self.registration.getNotifications();
      notifications
        .filter((notification) => notification.data?.userId !== userId)
        .forEach((notification) => notification.close());
    })(),
  );
});

self.addEventListener('push', (event) => {
  const result = pushNotificationPayloadSchema.safeParse(event.data?.json());
  const data = result.success
    ? result.data
    : { title: 'New Notification', body: 'You have a new notification!' };
  const canSnooze = Boolean(data.deliveryId && data.actionToken && data.snoozeMinutes);
  const options = {
    body: data.body,
    icon: data.icon ?? '/icon-192x192.png',
    badge: data.badge ?? '/icon-192x192.png',
    tag: data.tag,
    data,
    actions: canSnooze
      ? [
          { action: 'snooze', title: `Snooze ${data.snoozeMinutes}m` },
          { action: 'open', title: 'Open habit' },
        ]
      : undefined,
  };

  event.waitUntil(
    (async () => {
      const cache = await caches.open(accountCacheName);
      const response = await cache.match(accountCacheKey);
      const active = response ? await response.json() : null;
      if (!data.userId || active?.userId !== data.userId) return;
      await self.registration.showNotification(data.title, options);
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const result = pushNotificationPayloadSchema.safeParse(event.notification.data);
  const data = result.success ? result.data : null;

  if (event.action === 'snooze' && data?.deliveryId && data.actionToken && data.snoozeMinutes) {
    event.waitUntil(
      fetch('/api/push/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryId: data.deliveryId,
          actionToken: data.actionToken,
          minutes: data.snoozeMinutes,
        }),
      }).then((response) => {
        if (!response.ok) throw new Error('Failed to snooze reminder');
        return self.registration.showNotification('Reminder snoozed', {
          body: `We will remind you again in ${data.snoozeMinutes} minutes.`,
          icon: data.icon,
          badge: data.badge,
          tag: `${data.tag || data.deliveryId}-snoozed`,
        });
      }),
    );
    return;
  }

  const targetUrl = new URL(data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        const client = clientList.find((item) => item.focused) || clientList[0];
        return client.navigate(targetUrl).then(() => client.focus());
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
