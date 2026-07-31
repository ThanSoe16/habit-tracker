'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import {
  Bell,
  Clock,
  Star,
  Shield,
  Info,
  ChevronRight,
  Moon,
  Sun,
  Music,
  Smartphone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RingtoneDrawerModal } from './RingtoneDrawerModal';

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
  const {
    remindersEnabled,
    setRemindersEnabled,
    ringtone,
    vibrationEnabled,
    setVibrationEnabled,
    theme,
    setTheme,
  } = useUserStore();
  const [isRingtoneModalOpen, setIsRingtoneModalOpen] = useState(false);
  const { isSubscribed, subscribeToPush, unsubscribeFromPush, sendTestPush } =
    usePushNotifications();
  const router = useRouter();

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribeFromPush();
    } else {
      await subscribeToPush();
    }
  };

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

  const ringtoneLabels: Record<string, string> = {
    chime: 'Classic Chime',
    marimba: 'Marimba',
    radar: 'Radar Beep',
    digital: 'Digital Alarm',
    custom: 'Custom Audio',
  };

  const SETTING_GROUPS: SettingGroup[] = [
    {
      title: 'General',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          value: isSubscribed ? 'On' : 'Off',
          color: isSubscribed ? 'text-pink-500' : 'text-gray-400',
          bg: isSubscribed ? 'bg-pink-50 dark:bg-pink-950/40' : 'bg-gray-100 dark:bg-zinc-800',
          isToggle: true,
          toggled: isSubscribed,
          onClick: handlePushToggle,
        },
        {
          icon: Music,
          label: 'Alarm Ringtone',
          value: ringtoneLabels[ringtone] || 'Classic Chime',
          color: 'text-violet-500',
          bg: 'bg-violet-50 dark:bg-violet-950/40',
          onClick: () => setIsRingtoneModalOpen(true),
        },
        {
          icon: Smartphone,
          label: 'Vibration',
          color: 'text-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          isToggle: true,
          toggled: vibrationEnabled,
          onClick: () => {
            const nextState = !vibrationEnabled;
            setVibrationEnabled(nextState);
            if (nextState && typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
              navigator.vibrate(150);
            }
          },
        },
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Dark Mode',
          color: 'text-purple-500',
          bg: 'bg-purple-50 dark:bg-purple-950/40',
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
          bg: 'bg-amber-50 dark:bg-amber-950/40',
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          color: 'text-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        },
        {
          icon: Info,
          label: 'Version',
          value: '1.0.0',
          color: 'text-gray-500',
          bg: 'bg-gray-100 dark:bg-zinc-800',
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
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-gray-100 dark:border-zinc-800 overflow-hidden divide-y divide-gray-50 dark:divide-zinc-800">
            {group.items.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
                >
                  <item.icon className={`w-[18px] h-[18px] ${item.color}`} />
                </div>
                <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-white text-left">
                  {item.label}
                </span>
                {item.isToggle ? (
                  <div
                    className={`w-11 h-6 rounded-full flex items-center transition-colors ${
                      item.toggled ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
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
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-zinc-600 shrink-0" />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      <RingtoneDrawerModal
        isOpen={isRingtoneModalOpen}
        onClose={() => setIsRingtoneModalOpen(false)}
      />
    </div>
  );
}
