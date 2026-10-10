'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/goals');
  }, [router]);
  return (
    <p role="status" className="p-6 text-sm text-muted-foreground">
      Opening goals...
    </p>
  );
}
