'use client';

import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useHabitStore } from '@/store/use-habit-store';
import { Calendar, BarChart3, TrendingUp, CheckCircle, Award } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  format,
  startOfWeek,
  addDays,
  subMonths,
  subYears,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
} from 'date-fns';

type TimeRange = 'weekly' | 'monthly' | 'yearly';

export default function ReportsPage() {
  const { habits } = useHabitStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');

  const today = new Date();

  // 1. WEEKLY DATA
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  const weeklyData = weekDays.map((day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const count = habits.reduce((acc, h) => {
      const entry = h.history[dateKey];
      const isDone = typeof entry === 'boolean' ? entry : !!entry?.completed;
      return acc + (isDone ? 1 : 0);
    }, 0);
    return {
      label: format(day, 'EEE'),
      subLabel: format(day, 'd'),
      count,
    };
  });

  // 2. MONTHLY DATA (Days of current month)
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthlyData = monthDays.map((day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const count = habits.reduce((acc, h) => {
      const entry = h.history[dateKey];
      const isDone = typeof entry === 'boolean' ? entry : !!entry?.completed;
      return acc + (isDone ? 1 : 0);
    }, 0);
    return {
      label: format(day, 'd'),
      subLabel: format(day, 'MMM d'),
      count,
    };
  });

  // 3. YEARLY DATA (Months of current year)
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const yearMonths = eachMonthOfInterval({ start: yearStart, end: yearEnd });
  const yearlyData = yearMonths.map((month) => {
    const monthPrefix = format(month, 'yyyy-MM');
    const count = habits.reduce((acc, h) => {
      const monthEntries = Object.entries(h.history).filter(([date]) => date.startsWith(monthPrefix));
      const doneInMonth = monthEntries.filter(([, entry]) => typeof entry === 'boolean' ? entry : !!entry?.completed).length;
      return acc + doneInMonth;
    }, 0);
    return {
      label: format(month, 'MMM'),
      subLabel: format(month, 'yyyy'),
      count,
    };
  });

  const activeChartData = timeRange === 'weekly' ? weeklyData : timeRange === 'monthly' ? monthlyData : yearlyData;
  const maxCount = Math.max(5, ...activeChartData.map((d) => d.count));
  const totalCompleted = activeChartData.reduce((acc, d) => acc + d.count, 0);

  // Month-over-month trend rates (Last 6 Months)
  const monthLabels = Array.from({ length: 6 }, (_, i) => format(subMonths(today, 5 - i), 'MMM'));

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-gray-900 dark:text-white p-4 pb-28">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header with SidebarTrigger */}
        <header className="flex justify-between items-center py-1">
          <SidebarTrigger className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors" />

          <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
            Reports & Insights
          </h1>

          <div className="w-10 h-10" />
        </header>

        {/* TIME RANGE SELECTOR PILLS */}
        <div className="bg-gray-100 dark:bg-zinc-900 p-1.5 rounded-2xl flex items-center gap-1 border border-gray-200/50 dark:border-zinc-800">
          {(['weekly', 'monthly', 'yearly'] as TimeRange[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTimeRange(mode)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-black capitalize transition-all duration-200',
                timeRange === mode
                  ? 'bg-white dark:bg-zinc-800 text-primary shadow-md shadow-black/5 scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white',
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* SUMMARY CARD */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[28px] p-5 space-y-4 shadow-lg shadow-indigo-600/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white capitalize">{timeRange} Summary</h3>
                <p className="text-indigo-100 text-xs font-medium">Performance Overview</p>
              </div>
            </div>
            <span className="text-2xl font-black text-yellow-300">{totalCompleted} Done</span>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Total Habits</p>
              <p className="text-lg font-black text-white">{habits.length}</p>
            </div>
            <div className="border-x border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Completed</p>
              <p className="text-lg font-black text-white">{totalCompleted}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Avg / Period</p>
              <p className="text-lg font-black text-white">
                {Math.round(totalCompleted / (activeChartData.length || 1))}
              </p>
            </div>
          </div>
        </div>

        {/* DYNAMIC HABITS COMPLETED BAR CHART */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900 dark:text-white capitalize">
              Habits Completed ({timeRange})
            </h2>
            <span className="text-xs font-bold text-gray-400">
              {timeRange === 'weekly' ? 'This Week' : timeRange === 'monthly' ? format(today, 'MMMM yyyy') : format(today, 'yyyy')}
            </span>
          </div>

          <div className="flex items-end justify-between gap-1 pt-4 pb-1 px-1 h-48 overflow-x-auto no-scrollbar">
            {/* Bars */}
            <div className="flex-1 flex items-end justify-between h-full gap-1.5 min-w-full">
              {activeChartData.map((item, idx) => {
                const heightPercent = item.count > 0 ? (item.count / maxCount) * 100 : 6;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 min-w-[28px]">
                    {item.count > 0 && (
                      <div className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-indigo-500/30 mb-0.5">
                        {item.count}
                      </div>
                    )}
                    <div
                      className="w-full max-w-[24px] rounded-t-full transition-all duration-300"
                      style={{
                        height: `${Math.max(10, heightPercent)}%`,
                        backgroundColor: item.count > 0 ? '#6366f1' : '#f3f4f6',
                      }}
                    />
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* HABIT COMPLETION RATE LINE CHART */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Completion Rate Trend</h2>
            <span className="text-xs font-bold text-gray-400">Last 6 Months</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="relative h-44 flex flex-col justify-between text-[11px] font-semibold text-gray-400 border-b border-gray-100 dark:border-zinc-800">
              <div className="border-b border-gray-100 dark:border-zinc-800/60 pb-1">100%</div>
              <div className="border-b border-gray-100 dark:border-zinc-800/60 pb-1">80%</div>
              <div className="border-b border-gray-100 dark:border-zinc-800/60 pb-1">60%</div>
              <div className="border-b border-gray-100 dark:border-zinc-800/60 pb-1">40%</div>
              <div className="border-b border-gray-100 dark:border-zinc-800/60 pb-1">20%</div>
              <div className="pb-1">0%</div>

              {/* Line Curve Chart SVG Overlay */}
              <div className="absolute inset-0 left-10 flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 10 90 L 65 90 L 120 90 L 175 90 L 230 90 L 285 60 L 285 120 L 10 120 Z"
                    fill="url(#gradient)"
                  />
                  <path
                    d="M 10 90 L 65 90 L 120 90 L 175 90 L 230 90 L 285 60"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                  />
                  <circle cx="10" cy="90" r="4" fill="white" stroke="#6366f1" strokeWidth="3" />
                  <circle cx="65" cy="90" r="4" fill="white" stroke="#6366f1" strokeWidth="3" />
                  <circle cx="120" cy="90" r="4" fill="white" stroke="#6366f1" strokeWidth="3" />
                  <circle cx="175" cy="90" r="4" fill="white" stroke="#6366f1" strokeWidth="3" />
                  <circle cx="230" cy="90" r="4" fill="white" stroke="#6366f1" strokeWidth="3" />
                  <circle cx="285" cy="60" r="5" fill="white" stroke="#6366f1" strokeWidth="3" />
                </svg>

                {/* Badge for Current Rate */}
                <div className="absolute right-0 bottom-16 bg-indigo-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md">
                  25%
                </div>
              </div>
            </div>

            {/* X Axis Month Labels */}
            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 pl-10 pr-2 pt-1">
              {monthLabels.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
