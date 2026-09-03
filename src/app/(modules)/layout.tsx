import PageLayout from '@/components/layouts';
import { AuthGuard } from '@/components/providers/auth-guard';
import React, { Suspense } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <PageLayout>
        <Suspense>{children}</Suspense>
      </PageLayout>
    </AuthGuard>
  );
}
