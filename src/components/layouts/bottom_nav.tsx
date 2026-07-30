'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import { Dumbbell } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  activeIcon?: string;
  useLucide?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    icon: '/side-bar/home-inactive.png',
    activeIcon: '/side-bar/home-active.png',
    href: '/home',
  },
  {
    label: 'Gym Plan',
    useLucide: true,
    href: '/gym',
  },
  {
    label: 'Mood Stat',
    icon: '/side-bar/mood-inactive.png',
    activeIcon: '/side-bar/mood-active.png',
    href: '/mood',
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
      <div className="flex items-center justify-around w-full max-w-lg mx-auto h-14 px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 transition-all duration-300 relative min-w-0"
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative',
                )}
              >
                {item.useLucide ? (
                  <Dumbbell
                    className={cn(
                      'w-5 h-5 transition-all duration-300 relative z-10',
                      isActive ? 'text-primary font-bold scale-110' : 'text-gray-500',
                    )}
                  />
                ) : (
                  <Image
                    src={isActive ? item.activeIcon! : item.icon!}
                    alt={item.label}
                    width={24}
                    height={24}
                    className={cn('w-5 h-5 transition-all duration-300 relative z-10')}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-[9px] sm:text-[10px] tracking-tight transition-colors duration-300 relative z-10 truncate px-0.5',
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
