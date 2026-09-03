import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { z } from 'zod';

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const sendPushSchema = z.object({
  subscription: pushSubscriptionSchema,
  title: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(500),
});

webpush.setVapidDetails(
  process.env.NEXT_PUBLIC_VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY || '',
);

export async function POST(request: Request) {
  try {
    const result = sendPushSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid notification request', issues: result.error.flatten() },
        { status: 400 },
      );
    }

    const { subscription, title, body } = result.data;
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title,
        body,
        icon: '/icon-192x192.png',
      }),
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
