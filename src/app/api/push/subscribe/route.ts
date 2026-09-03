import { NextResponse } from 'next/server';
import { z } from 'zod';

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  const result = pushSubscriptionSchema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid push subscription', issues: result.error.flatten() },
      { status: 400 },
    );
  }

  const subscription = result.data;

  // TODO: Save subscription to database
  // e.g. await db.users.update({ where: { id: userId }, data: { pushSubscription: subscription } })

  return NextResponse.json({
    message: 'Subscription received',
    endpoint: subscription.endpoint,
  });
}
