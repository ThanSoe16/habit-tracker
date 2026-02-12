"use client";

import { useHabitStore } from "@/store/useHabitStore";
import { startOfWeek, addDays, format } from "date-fns";
import { ChevronDown } from "lucide-react";

export function HabitsCompletedChart() {
  const { habits } = useHabitStore();

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  // Count completions per day for the current week
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const dateStr = format(day, "yyyy-MM-dd");
    const completed = habits.filter((h) => {
      const entry = h.history[dateStr];
      return typeof entry === "boolean" ? entry : entry?.completed;
    }).length;

    return {
      day: format(day, "d"),
      completed,
    };
  });

  const maxValue = Math.max(7, ...weekData.map((d) => d.completed));
  const yLabels = Array.from({ length: maxValue }, (_, i) => maxValue - i);
  const highestDay = weekData.reduce(
    (max, d) => (d.completed > max.completed ? d : max),
    weekData[0],
  );

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-foreground">
          Habits Completed
        </h3>
        <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-gray-100 px-3 py-1.5 rounded-full">
          This Week
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chart */}
      <div className="flex gap-1">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between pr-2 pb-6">
          {yLabels.map((label) => (
            <span
              key={label}
              className="text-[10px] text-muted-foreground text-right leading-none"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Bars */}
        <div className="flex-1 flex items-end justify-between gap-2">
          {weekData.map((d, i) => {
            const height = d.completed > 0 ? (d.completed / maxValue) * 100 : 4;
            const isHighest =
              d.completed > 0 && d.completed === highestDay.completed;

            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="relative w-full flex justify-center">
                  {/* Tooltip */}
                  {isHighest && d.completed > 0 && (
                    <div className="absolute -top-7 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {d.completed}
                    </div>
                  )}
                  {/* Bar */}
                  <div
                    className="w-full max-w-[32px] rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${Math.max(height, 4)}px`,
                      minHeight: "4px",
                      maxHeight: "120px",
                      backgroundColor:
                        d.completed > 0
                          ? isHighest
                            ? "#818CF8"
                            : "#C7D2FE"
                          : "#F3F4F6",
                    }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium mt-1">
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
