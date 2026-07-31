import PageLayout from '@/components/layouts';
import React, { Suspense } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout>
      <Suspense>{children}</Suspense>
    </PageLayout>
  );
}
