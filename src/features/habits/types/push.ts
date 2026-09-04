import { z } from 'zod';
import { reminderSnoozeMinutesSchema } from './index';

export const webPushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const subscribeToPushSchema = z.object({
  subscription: webPushSubscriptionSchema,
  timezone: z.string().trim().min(1).max(100),
});

export const unsubscribeFromPushSchema = z.object({
  endpoint: z.string().url(),
});

export const snoozePushReminderSchema = z.object({
  actionToken: z.string().uuid(),
  deliveryId: z.string().uuid(),
  minutes: reminderSnoozeMinutesSchema,
});

export const pushSubscriptionRowSchema = z.object({
  id: z.string().uuid(),
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  timezone: z.string().min(1),
  action_token: z.string().uuid(),
});

export const reminderDeliveryRowSchema = z.object({
  id: z.string().uuid(),
  subscription_id: z.string().uuid(),
  habit_id: z.string(),
  reminder_date: z.string(),
  scheduled_time: z.string(),
  sent_at: z.string().nullable(),
  snoozed_until: z.string().nullable(),
  snooze_sent_at: z.string().nullable(),
});

export const pushNotificationPayloadSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  icon: z.string().optional(),
  badge: z.string().optional(),
  tag: z.string().optional(),
  url: z.string().optional(),
  habitId: z.string().optional(),
  deliveryId: z.string().uuid().optional(),
  actionToken: z.string().uuid().optional(),
  snoozeMinutes: reminderSnoozeMinutesSchema.optional(),
});

export type WebPushSubscription = z.infer<typeof webPushSubscriptionSchema>;
export type PushSubscriptionRow = z.infer<typeof pushSubscriptionRowSchema>;
export type ReminderDeliveryRow = z.infer<typeof reminderDeliveryRowSchema>;
