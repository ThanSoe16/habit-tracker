"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface MonthNavigatorProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthNavigator({
  currentDate,
  onPrevMonth,
  onNextMonth,
}: MonthNavigatorProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <button
        onClick={onPrevMonth}
        className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <h2 className="text-lg font-bold text-foreground tracking-tight">
        {format(currentDate, "MMMM yyyy")}
      </h2>
      <button
        onClick={onNextMonth}
        className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
