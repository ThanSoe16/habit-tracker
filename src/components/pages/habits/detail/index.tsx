'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
// Assuming we have a Calendar component or we'll build a simplified one for stats
import {
  addMonths,
  format,
  isAfter,
  parseISO,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';
import { isHabitRequiredOnDate, getLocalDateString } from '@/utils/dateUtils';

export default function HabitDetail({ id }: { id: string }) {
  const [viewDate, setViewDate] = React.useState(new Date());
  const router = useRouter();
  const { habits, removeHabit } = useHabitStore();
  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Habit not found</p>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this habit?')) {
      removeHabit(habit.id);
      router.back();
    }
  };

  // Navigation functions
  const handlePrevMonth = () => setViewDate(addMonths(viewDate, -1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  // Calculate Real Stats
  const history = habit.history;
  const historyEntries = Object.entries(history);
  const totalCompletions = historyEntries.filter(([, entry]) =>
    typeof entry === 'boolean' ? entry : entry.completed,
  ).length;

  // Calculate perfect days (days where all required habits were done - for THIS habit, it's just completions)
  // But user asked for "Total perfect days" and "Completion rate"
  // Let's calculate Completion Rate based on required days since habit start
  const startDate = habit.startDate ? parseISO(habit.startDate) : new Date(habit.createdAt);
  const today = startOfDay(new Date());

  // Count required days from start until today
  let requiredDaysCount = 0;
  let tempDate = startOfDay(startDate);
  while (!isAfter(tempDate, today)) {
    if (isHabitRequiredOnDate(habit as any, tempDate)) {
      requiredDaysCount++;
    }
    tempDate = new Date(tempDate.getTime() + 24 * 60 * 60 * 1000);
  }

  const completionRate =
    requiredDaysCount > 0 ? Math.round((totalCompletions / requiredDaysCount) * 100) : 0;

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Habit</h1>
        <div className="flex gap-1">
          <button
            onClick={() => router.push(`/habits/${habit.id}/edit`)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={handleDelete}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </header>

      <div className="px-6 py-4 space-y-6">
        {/* Habit Info */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
            style={{ backgroundColor: habit.color + '20' }}
          >
            {habit.emoji || '✨'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{habit.name}</h2>
            <p className="text-gray-500 font-medium">Everyday</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5">
            <p className="text-[17px] font-bold text-gray-800">{habit.streak} days</p>
            <p className="text-[13px] text-gray-400 font-medium mt-1">Current streak</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5">
            <p className="text-[17px] font-bold text-gray-800">{completionRate}%</p>
            <p className="text-[13px] text-gray-400 font-medium mt-1">Completion rate</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5">
            <p className="text-[17px] font-bold text-gray-800">{totalCompletions}</p>
            <p className="text-[13px] text-gray-400 font-medium mt-1">Habits completed</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/5">
            <p className="text-[17px] font-bold text-gray-800">{totalCompletions}</p>
            <p className="text-[13px] text-gray-400 font-medium mt-1">Total perfect days</p>
          </div>
        </div>

        {/* Calendar Stats */}
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Calendar Stats</h3>
            <div className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
              This Month
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-6">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
              <p className="text-[15px] font-bold text-gray-800">{format(viewDate, 'MMMM yyyy')}</p>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors rotate-180"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="w-full grid grid-cols-7 gap-y-4">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                <div key={d} className="text-center text-[11px] font-bold text-gray-400">
                  {d}
                </div>
              ))}
              {days.map((day) => {
                const dateKey = getLocalDateString(day);
                const entry = habit.history[dateKey];
                const isDone = typeof entry === 'boolean' ? entry : entry?.completed;
                const isRequired = isHabitRequiredOnDate(habit as any, day);

                return (
                  <div key={dateKey} className="flex items-center justify-center">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                        isDone
                          ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                          : isRequired
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                            : 'text-gray-400',
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
