'use client';

import { useEffect, useRef } from 'react';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { requireIdentity } from '@/lib/supabase/require-identity';

/** Keep a completed request from navigating or notifying a replacement screen. */
export function useSubmissionScope() {
  const userId = useQueryIdentity();
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  return {
    isCurrent: () => active.current,
    assertCurrent: async () => {
      if (!active.current || !userId) throw new Error('Your session changed. Please reload.');
      await requireIdentity(userId);
      if (!active.current) throw new Error('Your session changed. Please reload.');
    },
  };
}
