import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { reminderDeliveryRowSchema } from '../types/push';
import type { ReminderSnoozeMinutes } from '../types';

export const snoozePushReminder = async (
  deliveryId: string,
  actionToken: string,
  minutes: ReminderSnoozeMinutes,
) => {
  const supabase = createSupabaseAdmin();
  const deliveryResult = await supabase
    .from('habit_reminder_deliveries')
    .select('*')
    .eq('id', deliveryId)
    .maybeSingle();
  if (deliveryResult.error) throw deliveryResult.error;
  if (!deliveryResult.data) return false;

  const delivery = reminderDeliveryRowSchema.parse(deliveryResult.data);
  const subscriptionResult = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('id', delivery.subscription_id)
    .eq('action_token', actionToken)
    .maybeSingle();
  if (subscriptionResult.error) throw subscriptionResult.error;
  if (!subscriptionResult.data) return false;

  const { error } = await supabase
    .from('habit_reminder_deliveries')
    .update({
      snoozed_until: new Date(Date.now() + minutes * 60_000).toISOString(),
      snooze_sent_at: null,
    })
    .eq('id', deliveryId);
  if (error) throw error;

  return true;
};
