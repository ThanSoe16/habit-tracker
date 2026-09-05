'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/use-user-store';
import { useBudgetStore, CURRENCIES, CurrencyCode } from '@/store/use-budget-store';
import {
  Star,
  Shield,
  Info,
  ChevronRight,
  Music,
  Smartphone,
  Coins,
  X,
  Check,
  Palette,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RingtoneDrawerModal } from './ringtone-drawer-modal';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { AppearanceDrawerModal } from './appearance-drawer-modal';

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
    ringtone,
    vibrationEnabled,
    setVibrationEnabled,
    theme,
    appearanceSettings,
  } = useUserStore();

  const { currency, setCurrency } = useBudgetStore();

  const [isRingtoneModalOpen, setIsRingtoneModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);

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
          icon: Coins,
          label: 'Currency',
          value: `${CURRENCIES[currency]?.flag || '💵'} ${currency}`,
          color: 'text-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          onClick: () => setIsCurrencyModalOpen(true),
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
          icon: Palette,
          label: 'Appearance',
          value: `${theme === 'system' ? 'Device' : theme === 'dark' ? 'Dark' : 'Light'} · ${appearanceSettings.accentColor}`,
          color: 'text-purple-500',
          bg: 'bg-purple-50 dark:bg-purple-950/40',
          onClick: () => setIsAppearanceModalOpen(true),
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

      <AppearanceDrawerModal
        isOpen={isAppearanceModalOpen}
        onOpenChange={setIsAppearanceModalOpen}
      />

      {/* CURRENCY DRAWER MODAL */}
      <Drawer open={isCurrencyModalOpen} onOpenChange={setIsCurrencyModalOpen}>
        <DrawerContent className="z-[80] max-w-lg mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-t-[36px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <DrawerTitle className="text-base font-black">
              Select Currency
            </DrawerTitle>
            <button
              type="button"
              onClick={() => setIsCurrencyModalOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
              const info = CURRENCIES[code];
              const isSelected = currency === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setCurrency(code);
                    setIsCurrencyModalOpen(false);
                  }}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 font-extrabold text-amber-700 dark:text-amber-400'
                      : 'border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.flag}</span>
                    <div className="text-left">
                      <p className="text-sm">{info.name}</p>
                      <p className="text-xs text-gray-400 font-semibold">{code} ({info.symbol})</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-amber-500" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
