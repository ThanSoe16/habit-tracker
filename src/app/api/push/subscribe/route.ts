import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const subscription = await request.json();

  console.log('Received subscription:', subscription);

  // TODO: Save subscription to database
  // e.g. await db.users.update({ where: { id: userId }, data: { pushSubscription: subscription } })

  return NextResponse.json({ message: 'Subscription received' });
}
