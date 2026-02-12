"use client";
import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/utils/cn";

import { HabitList } from "@/components/pages/home/_components/HabitList";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
} from "date-fns";
import { HomeHeader } from "./_components/HomeHeader";
import { useRouter } from "next/navigation";
import { CalendarStrip } from "./_components/CalendarStrip";
import { WeeklyHabitList } from "./_components/WeeklyHabitList";
import { OverallHabitList } from "./_components/OverallHabitList";
import { PromoCard } from "./_components/PromoCard";
import { useQueryState, parseAsStringLiteral } from "nuqs";

export default function Home() {
  const router = useRouter();
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

  const [viewMode, setViewMode] = useQueryState(
    "view",
    parseAsStringLiteral(["today", "weekly", "overall"]).withDefault("today"),
  );

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

          {/* Tab Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl mx-2">
            {(["today", "weekly", "overall"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize",
                  viewMode === mode
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-200",
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {viewMode === "today" && (
            <CalendarStrip
              scrollContainerRef={scrollContainerRef}
              weekDays={allMonthDays}
              onSelectDate={setSelectedDate}
            />
          )}

          <PromoCard />
        </div>

        {/* Scrollable Daily Routine */}
        <section className="flex-1 space-y-2 pb-24">
          <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-1">
            <h2 className="text-xl font-semibold">
              {viewMode === "today"
                ? "Daily routine"
                : viewMode === "weekly"
                  ? "Weekly routine"
                  : "Overall progress"}
            </h2>
            {viewMode !== "today" && (
              <button
                onClick={() => router.push(`/${viewMode}`)}
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                See all
              </button>
            )}
          </div>
          {viewMode === "today" ? (
            <HabitList selectedDate={selectedDate} />
          ) : viewMode === "weekly" ? (
            <WeeklyHabitList limit={5} />
          ) : viewMode === "overall" ? (
            <OverallHabitList limit={5} />
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Coming soon...
            </div>
          )}
        </section>
      </div>

      {/* Floating Layout for Add Button */}
      <div className="fixed bottom-28 right-6 z-50">
        <button
          onClick={() => router.push("/habits/create")}
          className="rounded-full w-14 h-14 shadow-2xl bg-blue-600 hover:bg-blue-600/90 text-white p-0 flex items-center justify-center shrink-0 border-[3px] border-white/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
