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
  const isMainPage = NAV_ITEMS.some((item) => item.href === pathname) || pathname === '/report';
  if (!isMainPage) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 pointer-events-none flex justify-center px-4">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl shadow-blue-900/15 rounded-full px-3 py-2 flex items-center justify-between gap-1 max-w-[340px] w-full">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
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
                    ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/35 scale-105'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                )}
              >
                {item.useLucide ? (
                  <Dumbbell
                    className={cn(
                      'w-5 h-5 transition-transform duration-300',
                      isActive ? 'text-white' : 'text-gray-400'
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
                      isActive && 'brightness-0 invert'
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
