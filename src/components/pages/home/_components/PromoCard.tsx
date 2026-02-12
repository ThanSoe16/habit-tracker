import React, { useState } from 'react';
import { Bell, BellOff, Check, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/useUserStore';
import { useDailyReminder } from '@/hooks/useDailyReminder';

export function PromoCard() {
  const { remindersEnabled, dailyReminderTime, setRemindersEnabled, setDailyReminderTime } =
    useUserStore();
  const { requestPermission, playNotificationSound } = useDailyReminder();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSetReminder = async () => {
    if (remindersEnabled) {
      // Turn off
      setRemindersEnabled(false);
      setShowTimePicker(false);
      return;
    }

    // Request permission first
    const granted = await requestPermission();
    if (granted) {
      setShowTimePicker(true);
    } else {
      alert('Please allow notifications in your browser settings to use reminders.');
    }
  };

  const handleConfirmTime = () => {
    setRemindersEnabled(true);
    setShowTimePicker(false);
    playNotificationSound();
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  if (remindersEnabled && !showTimePicker) {
    return (
      <div className="relative overflow-hidden bg-secondary rounded-xl p-5 pr-4 shadow-sm h-40 flex flex-col justify-center">
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
              Reminder set! ✅
            </h3>
            <p className="text-xs text-muted-foreground max-w-48 leading-relaxed font-medium">
              {"You'll"} be reminded daily at{' '}
              <span className="font-bold text-foreground">{formatTime(dailyReminderTime)}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-full px-5 h-9 font-bold text-xs tracking-wide"
              variant="outline"
              onClick={() => setShowTimePicker(true)}
            >
              Change Time
            </Button>
            <Button
              size="sm"
              className="rounded-full px-5 h-9 font-bold text-xs tracking-wide"
              variant="ghost"
              onClick={handleSetReminder}
            >
              <BellOff className="w-3.5 h-3.5 mr-1" />
              Turn Off
            </Button>
          </div>
        </div>

        <div className="absolute -right-10 bottom-[-20px] rotate-[-5deg] z-0 pointer-events-none select-none">
          <Bell className="w-48 h-48 fill-primary/20 text-primary/20 drop-shadow-2xl" />
        </div>
      </div>
    );
  }

  if (showTimePicker) {
    return (
      <div className="relative overflow-hidden bg-secondary rounded-xl p-5 pr-4 shadow-sm h-40 flex flex-col justify-center">
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground">What time?</h3>
            <button
              onClick={playNotificationSound}
              className="text-[10px] flex items-center gap-1 text-indigo-500 font-bold hover:underline"
            >
              <Volume2 className="w-3 h-3" /> Test Sound
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={dailyReminderTime}
              onChange={(e) => setDailyReminderTime(e.target.value)}
              className="h-10 px-2 rounded-xl border border-gray-200 bg-background text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-28"
            />
            <Button
              size="sm"
              className="rounded-full px-5 h-10 font-bold text-xs tracking-wide"
              onClick={handleConfirmTime}
            >
              <Check className="w-4 h-4 mr-1" />
              Confirm
            </Button>
          </div>
        </div>

        <div className="absolute -right-10 bottom-[-20px] rotate-[-5deg] z-0 pointer-events-none select-none">
          <Bell className="w-48 h-48 fill-primary text-primary drop-shadow-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-secondary rounded-xl p-5 pr-4 shadow-sm h-40 flex flex-col justify-center">
      <div className="relative z-10 flex flex-col items-start gap-4">
        <div className="space-y-2">
          <h3 className="font-bold text-xl text-foreground">Set the reminder</h3>
          <p className="text-xs text-muted-foreground max-w-48 leading-relaxed font-medium">
            Never miss your morning routine! Set a reminder to stay on track.
          </p>
        </div>
        <Button
          size="sm"
          className="rounded-full px-6 h-10 font-bold bg-[#5D4037] text-white hover:bg-black/80 border-none shadow-lg text-xs tracking-wide"
          onClick={handleSetReminder}
        >
          Set Now
        </Button>
      </div>

      {/* Decorative Bell */}
      <div className="absolute -right-10 bottom-[-20px] rotate-[-5deg] z-0 pointer-events-none select-none">
        <Bell className="w-48 h-48 fill-primary text-primary drop-shadow-2xl" />
      </div>
    </div>
  );
}
