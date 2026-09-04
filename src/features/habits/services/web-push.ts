import webpush from 'web-push';
import { z } from 'zod';
import type { PushSubscriptionRow } from '../types/push';

const webPushEnvSchema = z.object({
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_SUBJECT: z.string().min(1),
});

const pushErrorSchema = z.object({
  statusCode: z.number().optional(),
});

let configured = false;

const configureWebPush = () => {
  if (configured) return;

  const env = webPushEnvSchema.parse(process.env);
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );
  configured = true;
};

export const sendWebPush = async (
  subscription: PushSubscriptionRow,
  payload: Record<string, unknown>,
) => {
  configureWebPush();

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    JSON.stringify(payload),
  );
};

export const isExpiredPushSubscription = (error: unknown) => {
  const result = pushErrorSchema.safeParse(error);
  return result.success && [404, 410].includes(result.data.statusCode || 0);
};
