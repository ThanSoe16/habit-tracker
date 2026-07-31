'use client';

import React, { useState } from 'react';
import { MoodHeader } from './_components/MoodHeader';
import { MonthNavigator } from './_components/MonthNavigator';
import { MoodCalendar } from './_components/MoodCalendar';
import { MoodEntryDrawer } from './_components/MoodEntryDrawer';
import { MoodSidebarDrawerModal } from './_components/MoodSidebarDrawerModal';
import { addMonths, subMonths } from 'date-fns';

export default function MoodPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fd] dark:bg-zinc-950 text-foreground selection:bg-blue-500/10 pb-28">
      <div className="w-full max-w-lg mx-auto h-full flex flex-col p-4 space-y-4">
        <MoodHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
        <div className="flex-1 rounded-[32px] overflow-y-auto shadow-xs border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2">
          <MonthNavigator
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          <MoodCalendar currentDate={currentDate} onDayClick={handleDayClick} />
        </div>
      </div>

      <MoodEntryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedDate={selectedDate}
      />

      <MoodSidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
