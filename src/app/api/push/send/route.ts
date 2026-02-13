import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.NEXT_PUBLIC_VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY || '',
);

export async function POST(request: Request) {
  const { subscription, title, body } = await request.json();

  try {
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
