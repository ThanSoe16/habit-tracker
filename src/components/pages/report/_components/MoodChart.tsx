"use client";

import { useMoodStore, MOODS } from "@/store/useMoodStore";
import { startOfWeek, addDays, format } from "date-fns";
import { ChevronDown } from "lucide-react";

export function MoodChart() {
  const { history } = useMoodStore();

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const dateStr = format(day, "yyyy-MM-dd");
    const entry = history[dateStr];

    // Map mood to a numeric value for the chart (1-5 scale)
    let moodValue = 3; // default neutral
    if (entry) {
      const moodIndex = MOODS.findIndex((m) => m.label === entry.label);
      // Great=5, Good=4, Okay=3, Not Good=2, Bad=1
      moodValue = moodIndex >= 0 ? 5 - moodIndex : 3;
    }

    return {
      day: format(day, "d"),
      emoji: entry?.emoji || "",
      moodValue,
      hasEntry: !!entry,
      label: entry?.label || "",
    };
  });

  // SVG dimensions for mood area chart
  const svgWidth = 320;
  const svgHeight = 100;
  const paddingX = 10;
  const paddingTop = 10;
  const paddingBottom = 5;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = weekData.map((d, i) => {
    const x = paddingX + (i / (weekData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.moodValue - 1) / 4) * chartHeight;
    return { x, y, ...d };
  });

  const smoothLine = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `M ${points[0].x},${svgHeight - paddingBottom} ${points.map((p) => `L ${p.x},${p.y}`).join(" ")} L ${points[points.length - 1].x},${svgHeight - paddingBottom} Z`;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Mood Chart</h3>
        <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-gray-100 px-3 py-1.5 rounded-full">
          This Week
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Emoji row */}
      <div className="flex justify-between px-1 mb-2">
        {weekData.map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-xl">{d.emoji || "·"}</span>
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-24">
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#C7D2FE" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FCA5A5" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#moodGradient)" />

        <polyline
          points={smoothLine}
          fill="none"
          stroke="#A5B4FC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between px-1 mt-1">
        {weekData.map((d, i) => (
          <span
            key={i}
            className="text-[11px] text-muted-foreground font-medium"
          >
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
