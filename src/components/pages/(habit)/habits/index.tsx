'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

import { HabitList } from './_components/habit-list';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { HomeHeader } from './_components/home-header';
import { useRouter } from 'next/navigation';
import { CalendarStrip } from './_components/calendar-strip';
import { WeeklyHabitList } from './_components/weekly-habit-list';
import { OverallHabitList } from './_components/overall-habit-list';
import { SidebarDrawerModal } from './_components/sidebar-drawer-modal';
import { ProgressStats } from './_components/progress-stats';
import { useUserStore } from '@/store/use-user-store';
interface HomePageProps {
  initialViewMode?: 'today' | 'weekly' | 'overall';
}

export default function Home({ initialViewMode = 'today' }: HomePageProps) {
  const router = useRouter();
  const { name: userName, avatarEmoji, homeSettings } = useUserStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const viewMode = initialViewMode;

  const today = new Date();

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 21) return 'Evening';
    return 'Night';
  };

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const monthDays = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const allMonthDays = monthDays.map((d) => {
    return {
      date: d,
      day: d.getDate(),
      weekday: format(d, 'EEE'),
      isToday: isSameDay(d, today),
      isSelected: isSameDay(d, selectedDate),
      id: `date-${format(d, 'yyyy-MM-dd')}`,
    };
  });

  const handleSelectViewMode = (mode: 'today' | 'weekly' | 'overall') => {
    router.push(`/habits/${mode}`);
  };

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
          <HomeHeader
            greeting={getGreeting()}
            name={userName}
            avatarEmoji={avatarEmoji}
            formattedDate={formattedDate}
          />

          {viewMode === 'today' && (
            <CalendarStrip
              scrollContainerRef={scrollContainerRef}
              weekDays={allMonthDays}
              onSelectDate={setSelectedDate}
            />
          )}
        </div>

        {/* Optional Progress Stats Banner */}
        {homeSettings?.showProgressBanner && viewMode === 'today' && (
          <div className="my-1">
            <ProgressStats />
          </div>
        )}

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
                        'px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all border',
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
            <WeeklyHabitList limit={5} />
          ) : viewMode === 'overall' ? (
            <OverallHabitList limit={5} />
          ) : (
            <div className="text-center py-10 text-muted-foreground">Coming soon...</div>
          )}
        </section>
      </div>

      {/* Floating Layout for Add Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={() => router.push('/managements/create')}
          className="rounded-full w-14 h-14 shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white p-0 flex items-center justify-center shrink-0 border-2 border-white dark:border-zinc-900 hover:scale-105 active:scale-95 transition-all"
          title="Create habit"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>

      {/* Navigation Sidebar Drawer */}
      <SidebarDrawerModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentViewMode={viewMode}
        onSelectViewMode={handleSelectViewMode}
      />
    </div>
  );
}
