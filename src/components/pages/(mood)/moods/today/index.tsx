'use client';
import { QueryFeedback } from '@/components/shared/infinite-list/query-feedback';

import React, { useState } from 'react';
import { MonthNavigator } from '../../_components/month-navigator';
import { MoodCalendar } from '../../_components/mood-calendar';
import { MoodEntryDrawer } from '../../_components/mood-entry-drawer';
import { useUserStore } from '@/store/use-user-store';
import { useMoodDates } from '@/features/mood/services/queries';
import { addMonths, subMonths, subDays, format } from 'date-fns';

export default function MoodTodayPage() {
  const showStreak = useUserStore((state) => state.moodSettings.showStreak);
  const dates = useMoodDates();
  const history = new Set(dates.data ?? []);
  let streak = 0;
  let cursor = new Date();
  if (!history.has(format(cursor, 'yyyy-MM-dd'))) cursor = subDays(cursor, 1);
  while (history.has(format(cursor, 'yyyy-MM-dd'))) {
    streak++;
    cursor = subDays(cursor, 1);
  }
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      {showStreak && (
        <p className="text-sm text-primary">
          {streak} day{streak === 1 ? '' : 's'} of mood check-ins
        </p>
      )}
      <div className="flex-1 rounded-[32px] overflow-y-auto shadow-xs border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2">
        <MonthNavigator
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <MoodCalendar currentDate={currentDate} onDayClick={handleDayClick} />
      </div>

      <MoodEntryDrawer
        key={`${selectedDate?.toISOString()}-${isDrawerOpen}`}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedDate={selectedDate}
      />
      <QueryFeedback query={dates} label="mood streak" />
    </div>
  );
}
