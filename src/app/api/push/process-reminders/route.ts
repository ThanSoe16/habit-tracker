import { NextResponse } from 'next/server';
import { processHabitPushReminders } from '@/features/habits/services/push-reminders';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processHabitPushReminders();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Failed to process habit reminders:', error);
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
  }
}
