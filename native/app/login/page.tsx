'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Flex } from '@radix-ui/themes';
import { EmailAuthForm } from '@/components/pages/auth/_components/email-auth-form';
import { useNativeStatus } from '@/lib/native/status';

export default function Page() {
  const router = useRouter();
  const userId = useNativeStatus((state) => state.userId);
  const loading = useNativeStatus((state) => state.loading);
  useEffect(() => {
    if (userId && !loading) router.replace('/goals');
  }, [userId, loading, router]);
  return (
    <main className="mx-auto w-full max-w-sm px-6 py-12">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="3">
          <Image src="/habit-tracker-icon.png" alt="" width={56} height={56} />
          <h1 className="text-2xl font-semibold">Goal Tracker</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account.</p>
        </Flex>
        <EmailAuthForm onSignedIn={() => router.replace('/goals')} />
      </Flex>
    </main>
  );
}
