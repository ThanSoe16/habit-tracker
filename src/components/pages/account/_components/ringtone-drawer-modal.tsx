'use client';

import React, { useState, useRef } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Play, Check, Upload, Music, Volume2, X } from 'lucide-react';
import { useUserStore, RingtoneType } from '@/store/use-user-store';
import { playAlarmSound } from '@/hooks/use-reminders';
import { uploadMediaToStorage } from '@/lib/supabase/services';
import { cn } from '@/utils/cn';

interface RingtoneDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RingtoneOption {
  id: RingtoneType;
  label: string;
  desc: string;
  badge?: string;
}

export function RingtoneDrawerModal({
  isOpen,
  onClose,
}: RingtoneDrawerModalProps) {
  const { ringtone, customRingtoneUrl, setRingtone } = useUserStore();
  const [selectedRingtone, setSelectedRingtone] = useState<RingtoneType>(ringtone || 'chime');
  const [customUrl, setCustomUrl] = useState<string | undefined>(customRingtoneUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const ringtoneOptions: RingtoneOption[] = [
    { id: 'chime', label: 'Classic Chime', desc: 'Pleasant 3-tone bell sequence (Default)' },
    { id: 'marimba', label: 'Marimba', desc: 'Warm woodblock melody' },
    { id: 'radar', label: 'Radar Beep', desc: 'Classic double pulse alert' },
    { id: 'digital', label: 'Digital Alarm', desc: 'Retro 8-bit electronic tone' },
    { id: 'custom', label: 'Custom Audio File', desc: customUrl ? 'Custom uploaded ringtone' : 'Upload your own .mp3, .wav audio', badge: customUrl ? 'Uploaded' : 'Upload' },
  ];

  const handleSelect = (id: RingtoneType) => {
    setSelectedRingtone(id);
    if (id !== 'custom') {
      playAlarmSound(id);
    } else if (customUrl) {
      playAlarmSound('custom', customUrl);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageUrl = await uploadMediaToStorage(file, file.name);
      const urlToUse = storageUrl || URL.createObjectURL(file);
      setCustomUrl(urlToUse);
      setSelectedRingtone('custom');
      setRingtone('custom', urlToUse);
      playAlarmSound('custom', urlToUse);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = () => {
    setRingtone(selectedRingtone, customUrl);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="z-[70] max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-t-[36px] pb-8 max-h-[85vh]">
        <div className="p-5 space-y-5 overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <DrawerTitle className="text-base font-black text-gray-900 dark:text-white">
                  Habit Alarm Ringtone
                </DrawerTitle>
                <DrawerDescription className="text-xs font-bold text-gray-400">
                  Select or upload your custom alarm sound
                </DrawerDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {ringtoneOptions.map((opt) => {
              const isSelected = selectedRingtone === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={cn(
                    'p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs'
                      : 'bg-gray-50/70 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-700/60 hover:bg-gray-100 dark:hover:bg-zinc-800',
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-gray-300 dark:border-zinc-600',
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {opt.label}
                        </h4>
                        {opt.badge && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 uppercase">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-gray-400 truncate">
                        {opt.desc}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    {opt.id === 'custom' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        disabled={isUploading}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Uploading...' : 'Upload MP3'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAlarmSound(opt.id);
                        }}
                        className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        title="Preview sound"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-500/25 transition-all"
          >
            Save Alarm Ringtone
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
