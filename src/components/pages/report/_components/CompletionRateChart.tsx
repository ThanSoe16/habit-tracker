"use client";

import { useHabitStore } from "@/store/useHabitStore";
import {
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from "date-fns";
import { isHabitRequiredOnDate } from "@/utils/dateUtils";
import { ChevronDown } from "lucide-react";

export function CompletionRateChart() {
  const { habits } = useHabitStore();

  const today = new Date();

  // Calculate completion rate for each of the last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(today, 5 - i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const days = eachDayOfInterval({
      start: monthStart,
      end: monthEnd > today ? today : monthEnd,
    });

    let required = 0;
    let completed = 0;

    days.forEach((day) => {
      habits.forEach((habit) => {
        const createdDate = new Date(habit.createdAt);
        if (day < createdDate) return;

        if (isHabitRequiredOnDate(habit, day)) {
          required++;
          const dateStr = format(day, "yyyy-MM-dd");
          const entry = habit.history[dateStr];
          const isDone = typeof entry === "boolean" ? entry : entry?.completed;
          if (isDone) completed++;
        }
      });
    });

    const rate = required > 0 ? Math.round((completed / required) * 100) : 0;

    return {
      month: format(monthDate, "MMM"),
      rate,
      isCurrent: i === 5,
    };
  });

  // SVG dimensions
  const svgWidth = 320;
  const svgHeight = 160;
  const paddingX = 10;
  const paddingTop = 20;
  const paddingBottom = 10;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = monthlyData.map((d, i) => {
    const x = paddingX + (i / (monthlyData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.rate / 100) * chartHeight;
    return { x, y, ...d };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Area fill path
  const areaPath = `M ${points[0].x},${svgHeight - paddingBottom} ${points.map((p) => `L ${p.x},${p.y}`).join(" ")} L ${points[points.length - 1].x},${svgHeight - paddingBottom} Z`;

  const yLabels = [100, 80, 60, 40, 20, 0];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">
          Habit Completion Rate
        </h3>
        <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-gray-100 px-3 py-1.5 rounded-full">
          Last 6 Months
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chart */}
      <div className="flex gap-1">
        {/* Y-axis */}
        <div className="flex flex-col justify-between pr-1 shrink-0">
          {yLabels.map((label) => (
            <span
              key={label}
              className="text-[10px] text-muted-foreground text-right leading-none"
            >
              {label}%
            </span>
          ))}
        </div>

        {/* SVG Chart */}
        <div className="flex-1 flex flex-col">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818CF8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#818CF8" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yLabels.map((label) => {
              const y = paddingTop + chartHeight - (label / 100) * chartHeight;
              return (
                <line
                  key={label}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#F3F4F6"
                  strokeWidth="1"
                />
              );
            })}

            {/* Area fill */}
            <path d={areaPath} fill="url(#areaGradient)" />

            {/* Line */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#818CF8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="white"
                  stroke="#818CF8"
                  strokeWidth="2"
                />
                {p.isCurrent && (
                  <>
                    <rect
                      x={p.x - 18}
                      y={p.y - 24}
                      width="36"
                      height="18"
                      rx="9"
                      fill="#818CF8"
                    />
                    <text
                      x={p.x}
                      y={p.y - 12}
                      textAnchor="middle"
                      className="text-[10px] font-bold"
                      fill="white"
                    >
                      {p.rate}%
                    </text>
                  </>
                )}
              </g>
            ))}
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between px-1 mt-1">
            {monthlyData.map((d, i) => (
              <span
                key={i}
                className="text-[10px] text-muted-foreground font-medium"
              >
                {d.month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
