"use client";

import { useHabitStore } from "@/store/useHabitStore";
import { X } from "lucide-react";

export function ProgressStats() {
  const { habits } = useHabitStore();

  // Mock data logic for visualization if no habits, else use habits
  const chartData =
    habits.length > 0
      ? habits.slice(0, 4).map((h) => ({
          label: h.name.split(" ")[0], // First word
          value: Math.min(100, (h.streak / 30) * 100), // Mock percentage based on streak aim 30
          color: h.color,
          displayValue: `${h.streak}d`,
        }))
      : [
          {
            label: "Walking",
            value: 48,
            color: "#3F2E26",
            displayValue: "48%",
          },
          {
            label: "Running",
            value: 33,
            color: "#A0522D",
            displayValue: "33%",
          },
          {
            label: "Meditation",
            value: 27,
            color: "#808000",
            displayValue: "27%",
          },
          { label: "Drink", value: 40, color: "#DA70D6", displayValue: "40%" },
        ];

  return (
    <div className="bg-[#FAF3EB] rounded-[2.5rem] p-8 relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <h2 className="text-3xl font-bold leading-tight text-[#2D2D2D] max-w-[12rem]">
          Your progress and insights
        </h2>
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-white/80 transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-64 mb-8">
        {chartData.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-3 w-full">
            <div className="relative w-full h-full flex items-end">
              {/* Background Bar (Hatched pattern) */}
              <div className="absolute inset-x-0 bottom-0 top-0 bg-[url('/hatch-pattern.png')] opacity-10 rounded-t-[2rem] bg-gray-200" />

              {/* Foreground Bar */}
              <div
                className="w-full rounded-t-[2rem] relative flex items-end justify-center pb-4 transition-all duration-1000 ease-out"
                style={{
                  height: `${Math.max(15, item.value)}%`,
                  backgroundColor: item.color,
                }}
              >
                <span className="text-white font-bold text-sm">
                  {item.displayValue}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground truncate max-w-full">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Points Section */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg">Points Earned</h3>
            <p className="text-muted-foreground text-xs">For this week</p>
          </div>
          <span className="text-2xl font-bold text-[#E67E22]">842 Points</span>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t pt-6">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Habits
            </p>
            <p className="font-bold text-lg">{habits.length}</p>
          </div>
          <div className="text-center border-l border-r">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Finished
            </p>
            <p className="font-bold text-lg">
              {habits.reduce(
                (acc, h) =>
                  acc +
                  (h.history[new Date().toISOString().split("T")[0]] ? 1 : 0),
                0,
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Streak
            </p>
            <p className="font-bold text-lg">
              {Math.max(0, ...habits.map((h) => h.streak))}
            </p>
          </div>
        </div>

        <button className="w-full bg-[#FF7F27] text-white font-bold py-4 rounded-full mt-6 hover:bg-[#FF7F27]/90 transition-colors shadow-lg shadow-orange-200">
          Share Progress
        </button>
      </div>
    </div>
  );
}
