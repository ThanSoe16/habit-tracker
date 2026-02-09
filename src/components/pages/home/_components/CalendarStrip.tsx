"use client";

import React, { RefObject } from "react";
import { cn } from "@/utils/cn";

interface CalendarStripProps {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  weekDays: Array<{
    date: Date;
    day: number;
    weekday: string;
    isToday: boolean;
    isSelected: boolean;
    id: string;
  }>;
  onSelectDate: (date: Date) => void;
}

export function CalendarStrip({ weekDays, onSelectDate }: CalendarStripProps) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-2 px-2">
      {weekDays.map((d, i) => (
        <div
          key={i}
          id={d.id}
          className="flex flex-col items-center gap-3 min-w-10 shrink-0"
        >
          <span
            className={cn(
              "text-xs font-medium transition-colors",
              d.isSelected ? "text-foreground font-bold" : "text-gray-400",
            )}
          >
            {d.weekday}
          </span>
          <button
            onClick={() => onSelectDate(d.date)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm",
              d.isSelected
                ? "bg-foreground text-white shadow-md scale-110"
                : "bg-white text-foreground hover:bg-gray-50",
            )}
          >
            {d.day}
          </button>
        </div>
      ))}
    </div>
  );
}
