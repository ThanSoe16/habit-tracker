import { NextResponse } from 'next/server';
import { subscribeToPushSchema, unsubscribeFromPushSchema } from '@/features/habits/types/push';
import {
  removePushSubscription,
  savePushSubscription,
} from '@/features/habits/services/push-subscriptions';

export async function POST(request: Request) {
  const result = subscribeToPushSchema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid push subscription', issues: result.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const subscription = await savePushSubscription(result.data.subscription, result.data.timezone);
    return NextResponse.json({ success: true, id: subscription.id });
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return NextResponse.json({ error: 'Failed to save push subscription' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const result = unsubscribeFromPushSchema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid push subscription', issues: result.error.flatten() },
      { status: 400 },
    );
  }

  try {
    await removePushSubscription(result.data.endpoint);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return NextResponse.json({ error: 'Failed to remove push subscription' }, { status: 500 });
  }
}
