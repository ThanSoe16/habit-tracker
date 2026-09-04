import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const saveSubscription = useCallback(async (value: PushSubscription) => {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: value.toJSON(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      }),
    });
    if (!response.ok) throw new Error('Failed to save push subscription');
  }, []);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      return;
    }

    navigator.serviceWorker.ready
      .then(async (value) => {
        setRegistration(value);
        const existing = await value.pushManager.getSubscription();
        if (!existing) return;
        setIsSubscribed(true);
        setSubscription(existing);
        await saveSubscription(existing);
      })
      .catch((error) => console.error('Failed to restore push subscription:', error));
  }, [saveSubscription]);

  const subscribeToPush = async () => {
    if (!registration || !VAPID_PUBLIC_KEY) {
      toast.error('Push notifications are not configured');
      return;
    }

    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
      });

      setSubscription(sub);
      setIsSubscribed(true);
      await saveSubscription(sub);
      toast.success('Push notifications enabled');
    } catch (error) {
      console.error('Failed to subscribe:', error);
      toast.error('Failed to enable push notifications');
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;
    try {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      toast.error('Failed to disable push notifications');
    }
  };

  const sendTestPush = async () => {
    if (!subscription) return;
    await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        title: 'Test Push',
        body: 'This is a test notification from the server! ☁️',
      }),
    });
  };

  return { isSubscribed, subscribeToPush, unsubscribeFromPush, sendTestPush };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
