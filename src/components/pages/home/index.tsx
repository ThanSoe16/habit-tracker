"use client";
import { useState, useRef, useEffect } from "react";

import { HabitList } from "@/components/pages/home/_components/HabitList";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
} from "date-fns";
import { AddHabitDialog } from "@/components/pages/home/_components/AddHabitDialog";
import { HomeHeader } from "./_components/HomeHeader";
import { CalendarStrip } from "./_components/CalendarStrip";
import { PromoCard } from "./_components/PromoCard";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const today = new Date();

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    if (hour < 21) return "Evening";
    return "Night";
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
      weekday: format(d, "EEE"),
      isToday: isSameDay(d, today),
      isSelected: isSameDay(d, selectedDate),
      id: `date-${format(d, "yyyy-MM-dd")}`,
    };
  });

  const isToday = selectedDate.toDateString() === today.toDateString();
  const formattedDate = isToday
    ? "Today"
    : selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  // Auto-scroll to center selected date
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedId = `date-${format(selectedDate, "yyyy-MM-dd")}`;
      const selectedEl = document.getElementById(selectedId);

      if (selectedEl && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollLeft =
          selectedEl.offsetLeft -
          container.offsetWidth / 2 +
          selectedEl.offsetWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [selectedDate]);

  return (
    <div className="overflow-hidden">
      <div className="px-4 pt-6 flex flex-col h-full">
        {/* Fixed Header & Calendar Section */}
        <div className="shrink-0 space-y-4 mb-4">
          <HomeHeader
            greeting={getGreeting()}
            name="Budi"
            formattedDate={formattedDate}
          />

          <CalendarStrip
            scrollContainerRef={scrollContainerRef}
            weekDays={allMonthDays}
            onSelectDate={setSelectedDate}
          />

          <PromoCard />
        </div>

        {/* Scrollable Daily Routine */}
        <section className="flex-1 space-y-2 pb-24">
          <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-1">
            <h2 className="text-xl font-semibold">Daily routine</h2>
            <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
              See all
            </button>
          </div>
          <HabitList selectedDate={selectedDate} />
        </section>
      </div>

      {/* Floating Layout for Add Button */}
      <div className="fixed bottom-28 right-6 z-50">
        <AddHabitDialog />
      </div>
    </div>
  );
}
