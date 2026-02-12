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

  return (
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
  );
};
