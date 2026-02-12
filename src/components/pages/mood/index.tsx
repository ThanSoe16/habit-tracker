'use client';

import React, { useState } from 'react';
import { MoodHeader } from './_components/MoodHeader';
import { MonthNavigator } from './_components/MonthNavigator';
import { MoodCalendar } from './_components/MoodCalendar';
import { MoodEntryDrawer } from './_components/MoodEntryDrawer';
import { addMonths, subMonths } from 'date-fns';

export default function MoodPage() {
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
    <div className="min-h-screen bg-gray-50 text-foreground selection:bg-indigo-500/10">
      <div className="max-w-4xl mx-auto h-full flex flex-col p-4">
        <MoodHeader />
        <div className="flex-1 rounded-xl overflow-y-auto shadow bg-white">
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
    </div>
  );
}
