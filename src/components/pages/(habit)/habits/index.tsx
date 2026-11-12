'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/utils/cn';

import { HabitList } from './_components/habit-list';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { HomeHeader } from './_components/home-header';
import { CalendarStrip } from './_components/calendar-strip';
import { HomeMoodCheckIn } from './_components/home-mood-check-in';
import { HabitListSkeleton } from './_components/habit-list-skeleton';

const WeeklyHabitList = dynamic(
  () => import('./_components/weekly-habit-list').then((module) => module.WeeklyHabitList),
  { loading: HabitListSkeleton },
);
const OverallHabitList = dynamic(
  () => import('./_components/overall-habit-list').then((module) => module.OverallHabitList),
  { loading: HabitListSkeleton },
);

interface HomePageProps {
  initialViewMode?: 'today' | 'weekly' | 'overall' | 'history';
}

function getMonthDays(todayKey: string, selectedDate: Date) {
  const currentDate = new Date(`${todayKey}T12:00:00`);
  return eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  }).map((date) => ({
    date,
    day: date.getDate(),
    weekday: format(date, 'EEE'),
    isToday: isSameDay(date, currentDate),
    isSelected: isSameDay(date, selectedDate),
    id: `date-${format(date, 'yyyy-MM-dd')}`,
  }));
}

export default function Home({ initialViewMode = 'today' }: HomePageProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const viewMode = initialViewMode;

  const today = new Date();

  const allMonthDays = getMonthDays(format(today, 'yyyy-MM-dd'), selectedDate);

  const isToday = selectedDate.toDateString() === today.toDateString();
  const formattedDate = isToday
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  // Auto-scroll to center selected date
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedId = `date-${format(selectedDate, 'yyyy-MM-dd')}`;
      const selectedEl = document.getElementById(selectedId);

      if (selectedEl && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollLeft =
          selectedEl.offsetLeft - container.offsetWidth / 2 + selectedEl.offsetWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedDate]);

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-lg mx-auto p-4 pb-32 flex flex-col min-h-screen space-y-3">
        {/* Fixed Header & Calendar Section */}
        <div className="shrink-0 space-y-1">
          <HomeHeader formattedDate={formattedDate} />

          {viewMode === 'today' && (
            <CalendarStrip
              scrollContainerRef={scrollContainerRef}
              weekDays={allMonthDays}
              onSelectDate={setSelectedDate}
            />
          )}
        </div>

        {/* Scrollable Daily Routine */}
        <section className="flex-1 space-y-3">
          {viewMode === 'today' ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {(['all', 'pending', 'completed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-transform border',
                        filter === f
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-gray-500 border-gray-200/80 dark:border-zinc-700 hover:bg-gray-50',
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <HabitList selectedDate={selectedDate} filter={filter} />
            </>
          ) : viewMode === 'weekly' ? (
            <WeeklyHabitList />
          ) : viewMode === 'overall' ? (
            <OverallHabitList />
          ) : (
            <div className="text-center py-10 text-muted-foreground">Coming soon...</div>
          )}
        </section>
      </div>

      {viewMode === 'today' && <HomeMoodCheckIn />}
    </div>
  );
}
