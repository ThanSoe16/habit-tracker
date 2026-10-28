'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useSyncExternalStore } from 'react';
import { useUserStore } from '@/store/use-user-store';
import { BottomNavIcon } from './bottom-nav-icon';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    icon: '/icons/home-icon.mp4',
    href: '/habits/today',
  },
  {
    label: 'Workout',
    icon: '/icons/gym-icon.mp4',
    href: '/workout/today',
  },
  {
    label: 'Mood Stat',
    icon: '/icons/mood-icon.mp4',
    href: '/mood/today',
  },
  {
    label: 'Budget',
    icon: '/icons/saving-icon.mp4',
    href: '/budget',
  },
  {
    label: 'Goals',
    icon: '/icons/goal-icon.mp4',
    href: '/goals',
  },
];

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotionSnapshot() {
  return true;
}

export function BottomNav() {
  const pathname = usePathname();
  const reduceAppMotion = useUserStore((state) => state.appearanceSettings.reduceMotion);
  const reduceSystemMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
  const isWorkoutManagementRoute =
    pathname === '/managements/plan' || pathname === '/managements/edit-personal-info';
  const isHabitManagementRoute = pathname.startsWith('/managements') && !isWorkoutManagementRoute;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 pointer-events-none flex justify-center px-4">
      <div className="pointer-events-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-100 dark:border-zinc-800 shadow-2xl shadow-blue-900/15 dark:shadow-black/80 rounded-full px-3 py-2 flex items-center justify-between gap-1 max-w-[340px] w-full transition-colors duration-300">
        {NAV_ITEMS.map((item) => {
          let isActive = false;
          if (item.href === '/habits/today') {
            isActive =
              pathname === '/' ||
              pathname.startsWith('/habits') ||
              pathname.startsWith('/home') ||
              isHabitManagementRoute ||
              (pathname.startsWith('/generals') &&
                !pathname.startsWith('/workout') &&
                !pathname.startsWith('/mood') &&
                !pathname.startsWith('/store') &&
                !pathname.startsWith('/budget')) ||
              pathname === '/report' ||
              pathname === '/settings';
          } else if (item.href === '/workout/today') {
            isActive =
              pathname.startsWith('/workout') ||
              isWorkoutManagementRoute ||
              pathname.startsWith('/workout-generals');
          } else if (item.href === '/mood/today' || item.href === '/mood') {
            isActive =
              pathname.startsWith('/mood') ||
              pathname.startsWith('/mood-generals') ||
              pathname.startsWith('/store') ||
              pathname.startsWith('/store-generals');
          } else if (item.href === '/budget') {
            isActive = pathname.startsWith('/budget') || pathname.startsWith('/budget-generals');
          } else if (item.href === '/goals') {
            isActive = pathname.startsWith('/goals');
          } else {
            isActive = pathname.startsWith(item.href);
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center justify-center transition-all duration-300 relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <div
                className={cn(
                  'size-10 rounded-xl flex items-center justify-center transition-colors duration-200 motion-reduce:transition-none',
                  isActive ? '' : 'hover:bg-accent/60',
                )}
              >
                <BottomNavIcon
                  src={item.icon}
                  reduceMotion={reduceAppMotion || reduceSystemMotion}
                />
              </div>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -bottom-[1px] h-0.5 w-[70%] rounded-full bg-primary transition-opacity duration-200 motion-reduce:transition-none',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
