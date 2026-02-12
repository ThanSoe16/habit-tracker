'use client';

import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Clock,
  Star, // Star is still used for "Rate App"
  Shield,
  Info,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SettingItem {
  icon: LucideIcon;
  label: string;
  value?: string;
  color: string;
  bg: string;
  isToggle?: boolean;
  toggled?: boolean;
  onClick?: () => void;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

export function SettingsList() {
  const { remindersEnabled, setRemindersEnabled, theme, setTheme } = useUserStore();
  const router = useRouter();

  const handleNotificationToggle = async () => {
    if (!remindersEnabled) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setRemindersEnabled(true);
        } else {
          alert(
            'Notification permission was denied. Please allow notifications in your browser settings.',
          );
        }
      } else {
        alert('Your browser does not support notifications.');
      }
    } else {
      setRemindersEnabled(false);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handleRemindersClick = () => {
    router.push('/habits');
  };

  const SETTING_GROUPS: SettingGroup[] = [
    {
      title: 'General',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          color: 'text-indigo-500',
          bg: 'bg-indigo-50',
          isToggle: true,
          toggled: remindersEnabled,
          onClick: handleNotificationToggle,
        },
        {
          icon: Clock,
          label: 'Reminders',
          value: 'Per habit',
          color: 'text-blue-500',
          bg: 'bg-blue-50',
          onClick: handleRemindersClick,
        },
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Theme',
          color: 'text-purple-500',
          bg: 'bg-purple-50',
          isToggle: true,
          toggled: theme === 'dark',
          onClick: handleThemeToggle,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: Star,
          label: 'Rate App',
          value: '⭐️',
          color: 'text-amber-500',
          bg: 'bg-amber-50',
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          color: 'text-emerald-500',
          bg: 'bg-emerald-50',
        },
        {
          icon: Info,
          label: 'Version',
          value: '1.0.0',
          color: 'text-gray-500',
          bg: 'bg-gray-100',
        },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {SETTING_GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {group.title}
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {group.items.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
                >
                  <item.icon className={`w-[18px] h-[18px] ${item.color}`} />
                </div>
                <span className="flex-1 text-sm font-semibold text-foreground text-left">
                  {item.label}
                </span>
                {item.isToggle ? (
                  <div
                    className={`w-11 h-6 rounded-full flex items-center transition-colors ${
                      item.toggled ? 'bg-indigo-500' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        item.toggled ? 'translate-x-5.5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                ) : (
                  <>
                    {item.value && (
                      <span className="text-xs text-muted-foreground font-medium">
                        {item.value}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
