import { createSupabaseAdmin } from '@/lib/supabase/admin';
import {
  pushSubscriptionRowSchema,
  type PushSubscriptionRow,
  type WebPushSubscription,
} from '../types/push';

export const savePushSubscription = async (
  subscription: WebPushSubscription,
  timezone: string,
): Promise<PushSubscriptionRow> => {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        timezone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return pushSubscriptionRowSchema.parse(data);
};

export const removePushSubscription = async (endpoint: string) => {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  if (error) throw error;
};

export const removePushSubscriptionById = async (id: string) => {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('push_subscriptions').delete().eq('id', id);
  if (error) throw error;
};
