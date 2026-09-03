'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import { Dumbbell, Archive, Wallet } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  activeIcon?: string;
  useLucide?: boolean;
  lucideIcon?: 'dumbbell' | 'archive' | 'wallet';
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    icon: '/side-bar/home-inactive.png',
    activeIcon: '/side-bar/home-active.png',
    href: '/habits/today',
  },
  {
    label: 'Workout',
    useLucide: true,
    lucideIcon: 'dumbbell',
    href: '/workout/today',
  },
  {
    label: 'Mood Stat',
    icon: '/side-bar/mood-inactive.png',
    activeIcon: '/side-bar/mood-active.png',
    href: '/mood/today',
  },
  {
    label: 'Store',
    useLucide: true,
    lucideIcon: 'archive',
    href: '/store',
  },
  {
    label: 'Budget',
    useLucide: true,
    lucideIcon: 'wallet',
    href: '/budget',
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const isWorkoutManagementRoute =
    pathname === '/managements/plan' || pathname === '/managements/edit-personal-info';
  const isHabitManagementRoute =
    pathname.startsWith('/managements') && !isWorkoutManagementRoute;

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
            isActive = pathname.startsWith('/mood') || pathname.startsWith('/mood-generals');
          } else if (item.href === '/store') {
            isActive = pathname.startsWith('/store') || pathname.startsWith('/store-generals');
          } else if (item.href === '/budget') {
            isActive = pathname.startsWith('/budget') || pathname.startsWith('/budget-generals');
          } else {
            isActive = pathname.startsWith(item.href);
          }

          const LucideIcon =
            item.lucideIcon === 'archive'
              ? Archive
              : item.lucideIcon === 'wallet'
                ? Wallet
                : Dumbbell;

          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className="flex flex-col items-center justify-center transition-all duration-300 relative"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/35 scale-105'
                    : 'text-gray-400 dark:text-zinc-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/80',
                )}
              >
                {item.useLucide ? (
                  <LucideIcon
                    className={cn(
                      'w-5 h-5 transition-transform duration-300',
                      isActive ? 'text-white' : 'text-gray-400 dark:text-zinc-300',
                    )}
                  />
                ) : (
                  <Image
                    src={isActive ? item.activeIcon! : item.icon!}
                    alt={item.label}
                    width={22}
                    height={22}
                    className={cn(
                      'w-5 h-5 transition-all duration-300',
                      isActive
                        ? 'brightness-0 invert'
                        : 'dark:brightness-0 dark:invert dark:opacity-75',
                    )}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
