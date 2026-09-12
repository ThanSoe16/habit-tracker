import { supabase } from '@/lib/supabase/client';

/** Detach the shared browser before ending the session that owns its subscription. */
export async function disconnectBrowserPush() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager?.getSubscription();
  if (!subscription) return;
  const { data } = await supabase.auth.getSession();
  // Unsubscribe locally even if the server cannot currently be reached.
  await subscription.unsubscribe();
  if (data.session) {
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => undefined);
  }
}
