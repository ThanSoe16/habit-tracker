'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import Image from 'next/image';

const NAV_ITEMS = [
  {
    label: 'Home',
    icon: '/side-bar/home-inactive.png',
    activeIcon: '/side-bar/home-active.png',
    href: '/home',
  },
  {
    label: 'Mood Stat',
    icon: '/side-bar/mood-inactive.png',
    activeIcon: '/side-bar/mood-active.png',
    href: '/mood',
  },
  {
    label: 'Report',
    icon: '/side-bar/report-inactive.png',
    activeIcon: '/side-bar/report-active.png',
    href: '/report',
  },
  {
    label: 'My Habits',
    icon: '/side-bar/habit-inactive.png',
    activeIcon: '/side-bar/habit-active.png',
    href: '/habits',
  },
  {
    label: 'Account',
    icon: '/side-bar/profile-inactive.png',
    activeIcon: '/side-bar/profile-active.png',
    href: '/account',
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // Only show bottom nav on main pages
  const isMainPage = NAV_ITEMS.some((item) => item.href === pathname);
  if (!isMainPage) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background shadow border-t border-gray-200">
      <div className="flex items-center justify-around w-full max-w-md mx-auto h-14 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 transition-all duration-300 relative"
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative',
                )}
              >
                <Image
                  src={isActive ? item.activeIcon : item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  className={cn('w-6 h-6 transition-all duration-300 relative z-10')}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] tracking-tight transition-colors duration-300 relative z-10',
                  isActive ? 'text-primary font-bold' : 'text-gray-500 font-medium',
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
