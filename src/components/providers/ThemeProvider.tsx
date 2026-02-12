'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUserStore();

  useEffect(() => {
    // Apply dark class on mount and whenever theme changes
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}
