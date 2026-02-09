"use client";
import { useState, useRef, useEffect } from "react";

import { HabitList } from "@/features/habits/components/HabitList";
import Link from "next/link";
import { Plus } from "lucide-react";
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

  const currentDay = today.getDay(); // 0=Sun
  const distanceToMon = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMon);

  const weekDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d,
      day: d.getDate(),
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      isToday: d.toDateString() === today.toDateString(),
      isSelected: d.toDateString() === selectedDate.toDateString(),
      id: `date-${d.toISOString().split("T")[0]}`,
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
      const selectedId = `date-${selectedDate.toISOString().split("T")[0]}`;
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
            weekDays={weekDays}
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
        <Link href="/home/new-habit">
          <button className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3px] border-white/20">
            <Plus className="w-7 h-7" />
          </button>
        </Link>
      </div>
    </div>
  );
}
