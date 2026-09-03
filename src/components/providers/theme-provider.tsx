'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/use-user-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, appearanceSettings } = useUserStore();

  useEffect(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const useDark = theme === 'dark' || (theme === 'system' && systemTheme.matches);
      root.classList.toggle('dark', useDark);
      root.style.colorScheme = useDark ? 'dark' : 'light';
    };

    applyTheme();
    systemTheme.addEventListener('change', applyTheme);

    return () => systemTheme.removeEventListener('change', applyTheme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.accent = appearanceSettings.accentColor;
    root.dataset.density = appearanceSettings.density;
    root.dataset.motion = appearanceSettings.reduceMotion ? 'reduced' : 'full';
  }, [appearanceSettings]);

  return <>{children}</>;
}
