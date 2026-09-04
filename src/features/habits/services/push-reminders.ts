import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { habitRowSchema, type HabitRow } from './supabase';
import {
  pushSubscriptionRowSchema,
  reminderDeliveryRowSchema,
  type PushSubscriptionRow,
  type ReminderDeliveryRow,
} from '../types/push';
import { isExpiredPushSubscription, sendWebPush } from './web-push';
import { removePushSubscriptionById } from './push-subscriptions';
import {
  getZonedDateParts,
  isHabitCompleted,
  isHabitReminderDue,
  isHabitScheduledForDate,
} from './push-schedule';

const getOrCreateDelivery = async (
  subscriptionId: string,
  habitId: string,
  reminderDate: string,
  scheduledTime: string,
) => {
  const supabase = createSupabaseAdmin();
  const query = () =>
    supabase
      .from('habit_reminder_deliveries')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .eq('habit_id', habitId)
      .eq('reminder_date', reminderDate)
      .eq('scheduled_time', scheduledTime)
      .maybeSingle();
  const existing = await query();
  if (existing.error) throw existing.error;
  if (existing.data) return reminderDeliveryRowSchema.parse(existing.data);

  const inserted = await supabase
    .from('habit_reminder_deliveries')
    .insert({
      subscription_id: subscriptionId,
      habit_id: habitId,
      reminder_date: reminderDate,
      scheduled_time: scheduledTime,
    })
    .select('*')
    .single();

  if (!inserted.error) return reminderDeliveryRowSchema.parse(inserted.data);
  const concurrent = await query();
  if (concurrent.error || !concurrent.data) throw inserted.error;
  return reminderDeliveryRowSchema.parse(concurrent.data);
};

const createPushPayload = (
  subscription: PushSubscriptionRow,
  habit: HabitRow,
  delivery: ReminderDeliveryRow,
) => {
  const snoozeMinutes = habit.reminder_snooze_minutes || 10;
  const isQuitHabit = habit.habit_kind === 'quit';

  return {
    title: isQuitHabit ? 'Bad-habit check-in' : 'Habit reminder',
    body: isQuitHabit
      ? `Stay strong: avoid ${habit.name} today.`
      : `Time for ${habit.emoji || '📋'} ${habit.name}.`,
    icon: '/habit-tracker-icon.png',
    badge: '/logo/128.png',
    tag: `habit-${habit.id}-${delivery.reminder_date}`,
    url: '/habits/today',
    habitId: habit.id,
    deliveryId: delivery.id,
    actionToken: subscription.action_token,
    snoozeMinutes,
  };
};

const markDelivery = async (id: string, field: 'sent_at' | 'snooze_sent_at') => {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from('habit_reminder_deliveries')
    .update({ [field]: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

const deliverReminder = async (
  subscription: PushSubscriptionRow,
  habit: HabitRow,
  delivery: ReminderDeliveryRow,
  field: 'sent_at' | 'snooze_sent_at',
) => {
  try {
    await sendWebPush(subscription, createPushPayload(subscription, habit, delivery));
    await markDelivery(delivery.id, field);
    return 'sent' as const;
  } catch (error) {
    if (isExpiredPushSubscription(error)) {
      await removePushSubscriptionById(subscription.id);
      return 'removed' as const;
    }
    throw error;
  }
};

export const processHabitPushReminders = async (now = new Date()) => {
  const supabase = createSupabaseAdmin();
  const [subscriptionsResult, habitsResult] = await Promise.all([
    supabase.from('push_subscriptions').select('*'),
    supabase.from('habits').select('*').not('reminder_time', 'is', null),
  ]);

  if (subscriptionsResult.error) throw subscriptionsResult.error;
  if (habitsResult.error) throw habitsResult.error;

  const subscriptions = subscriptionsResult.data.map((row) => pushSubscriptionRowSchema.parse(row));
  const habits = habitsResult.data.map((row) => habitRowSchema.parse(row));
  const subscriptionsById = new Map(
    subscriptions.map((subscription) => [subscription.id, subscription]),
  );
  const habitsById = new Map(habits.map((habit) => [habit.id, habit]));
  let sent = 0;
  let removed = 0;

  const snoozesResult = await supabase
    .from('habit_reminder_deliveries')
    .select('*')
    .not('snoozed_until', 'is', null)
    .is('snooze_sent_at', null)
    .lte('snoozed_until', now.toISOString());
  if (snoozesResult.error) throw snoozesResult.error;

  for (const value of snoozesResult.data) {
    const delivery = reminderDeliveryRowSchema.parse(value);
    const subscription = subscriptionsById.get(delivery.subscription_id);
    const habit = habitsById.get(delivery.habit_id);
    if (!subscription || !habit) continue;
    if (isHabitCompleted(habit, delivery.reminder_date)) {
      await markDelivery(delivery.id, 'snooze_sent_at');
      continue;
    }
    const result = await deliverReminder(subscription, habit, delivery, 'snooze_sent_at');
    result === 'sent' ? sent++ : removed++;
  }

  for (const subscription of subscriptions) {
    let zonedDate;
    try {
      zonedDate = getZonedDateParts(now, subscription.timezone);
    } catch {
      continue;
    }

    for (const habit of habits) {
      if (!isHabitReminderDue(habit, zonedDate)) continue;
      if (!isHabitScheduledForDate(habit, zonedDate, subscription.timezone)) continue;
      if (isHabitCompleted(habit, zonedDate.date)) continue;

      const delivery = await getOrCreateDelivery(
        subscription.id,
        habit.id,
        zonedDate.date,
        zonedDate.time,
      );
      if (delivery.sent_at) continue;

      const result = await deliverReminder(subscription, habit, delivery, 'sent_at');
      if (result === 'sent') sent++;
      if (result === 'removed') {
        removed++;
        break;
      }
    }
  }

  return { sent, removed };
};
