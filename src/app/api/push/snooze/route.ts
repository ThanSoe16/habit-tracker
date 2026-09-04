import { NextResponse } from 'next/server';
import { snoozePushReminder } from '@/features/habits/services/push-snooze';
import { snoozePushReminderSchema } from '@/features/habits/types/push';

export async function POST(request: Request) {
  const result = snoozePushReminderSchema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid snooze request', issues: result.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const snoozed = await snoozePushReminder(
      result.data.deliveryId,
      result.data.actionToken,
      result.data.minutes,
    );
    if (!snoozed) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to snooze push reminder:', error);
    return NextResponse.json({ error: 'Failed to snooze reminder' }, { status: 500 });
  }
}
