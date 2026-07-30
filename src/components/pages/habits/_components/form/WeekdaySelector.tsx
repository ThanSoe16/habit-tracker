import React from 'react';
import { cn } from '@/utils/cn';

const DAYS = [
  { value: 1, label: 'M' },
  { value: 2, label: 'T' },
  { value: 3, label: 'W' },
  { value: 4, label: 'T' },
  { value: 5, label: 'F' },
  { value: 6, label: 'S' },
  { value: 0, label: 'S' },
];

export const WeekdaySelector = ({
  value,
  onChange,
}: {
  value: number[];
  onChange: (value: number[]) => void;
}) => {
  const toggleDay = (day: number) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day]);
    }
  };

  const isEveryDay = [0, 1, 2, 3, 4, 5, 6].every((d) => value.includes(d));
  const isWeekdays =
    [1, 2, 3, 4, 5].every((d) => value.includes(d)) && !value.includes(0) && !value.includes(6);
  const isWeekends =
    [0, 6].every((d) => value.includes(d)) && ![1, 2, 3, 4, 5].some((d) => value.includes(d));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([0, 1, 2, 3, 4, 5, 6])}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-bold transition-all border',
            isEveryDay
              ? 'border-transparent text-white shadow-md bg-primary'
              : 'border-foreground/20 text-foreground hover:bg-primary/10',
          )}
        >
          Every Day
        </button>
        <button
          type="button"
          onClick={() => onChange([1, 2, 3, 4, 5])}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-bold transition-all border',
            isWeekdays
              ? 'border-transparent text-white shadow-md bg-primary'
              : 'border-foreground/20 text-foreground hover:bg-primary/10',
          )}
        >
          Weekdays
        </button>
        <button
          type="button"
          onClick={() => onChange([0, 6])}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-bold transition-all border',
            isWeekends
              ? 'border-transparent text-white shadow-md bg-primary'
              : 'border-foreground/20 text-foreground hover:bg-primary/10',
          )}
        >
          Weekends
        </button>
      </div>
      <div className="flex justify-between gap-1">
        {DAYS.map((day) => {
          const isSelected = value.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                'w-10 h-10 rounded-full text-xs font-bold transition-all border shrink-0 flex items-center justify-center',
                isSelected
                  ? 'border-transparent text-white shadow-md bg-primary'
                  : 'border-foreground/50 text-foreground hover:bg-primary/10',
              )}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
