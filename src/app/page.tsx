"use client";
import { useState, useRef, useEffect } from "react";

import { HabitList } from "@/features/habits/components/HabitList";
import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

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
    <main className="h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex flex-col overflow-hidden">
      <div className="container max-w-md mx-auto px-6 pt-6 flex flex-col h-full">
        {/* Fixed Header & Calendar Section */}
        <div className="shrink-0 space-y-4 mb-4">
          {/* Header */}
          <header className="flex justify-between items-start">
            <div className="space-y-1.5">
              <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1A1A] leading-none">
                {getGreeting()}, Budi
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                {formattedDate}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#FFE8D1] flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
              <img
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=Budi&backgroundColor=transparent`}
                alt="Profile"
                className="w-10 h-10 object-cover"
              />
            </div>
          </header>

          {/* Calendar Strip */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-4 overflow-x-auto pb-2 -mx-6 px-4 no-scrollbar"
          >
            {weekDays.map((d, i) => (
              <div
                key={i}
                id={d.id}
                className="flex flex-col items-center gap-3 min-w-10 shrink-0"
              >
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    d.isSelected ? "text-[#1A1A1A] font-bold" : "text-gray-400",
                  )}
                >
                  {d.weekday}
                </span>
                <button
                  onClick={() => setSelectedDate(d.date)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm",
                    d.isSelected
                      ? "bg-[#1A1A1A] text-white shadow-md scale-110"
                      : "bg-white text-[#1A1A1A] hover:bg-gray-50",
                  )}
                >
                  {d.day}
                </button>
              </div>
            ))}
          </div>

          {/* Promo Card (Reminder) */}
          <div className="relative overflow-hidden bg-[#FFE8D1] rounded-xl p-5 pr-4 shadow-sm h-40 flex flex-col justify-center">
            <div className="relative z-10 flex flex-col items-start gap-4">
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-[#4A3B32]">
                  Set the reminder
                </h3>
                <p className="text-xs text-[#8B7366] max-w-48 leading-relaxed font-medium">
                  Never miss your morning routine! Set a reminder to stay on
                  track.
                </p>
              </div>
              <Button
                size="sm"
                className="rounded-full px-6 h-10 font-bold bg-[#5D4037] text-white hover:bg-[#4A3B32] border-none shadow-lg text-xs tracking-wide"
              >
                Set Now
              </Button>
            </div>

            {/* Decorative Bell - Positioned exactly like screenshot */}
            <div className="absolute -right-10 bottom-[-20px] rotate-[-5deg] z-0 pointer-events-none select-none">
              <Bell className="w-48 h-48 fill-[#FF7F27] text-[#FF7F27] drop-shadow-2xl" />
            </div>
          </div>
        </div>

        {/* Scrollable Daily Routine */}
        <section className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-24">
          <div className="flex items-center justify-between sticky top-0 bg-[#F8F9FA] z-10 py-1">
            <h2 className="text-xl font-semibold">Daily routine</h2>
            <button className="text-xs font-semibold text-[#FF7F27] hover:text-[#E66000] transition-colors">
              See all
            </button>
          </div>
          <HabitList selectedDate={selectedDate} />
        </section>
      </div>

      {/* Floating Layout for Add Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/new-habit">
          <button className="w-14 h-14 rounded-full bg-[#545CEB] text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3px] border-white/20">
            <Plus className="w-7 h-7" />
          </button>
        </Link>
      </div>
    </main>
  );
}
