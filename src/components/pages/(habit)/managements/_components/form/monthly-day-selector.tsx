import React from 'react';
import { cn } from '@/utils/cn';

export const MonthlyDaySelector = ({
  value,
  onChange,
  selectedColor,
}: {
  value: number[];
  onChange: (value: number[]) => void;
  selectedColor?: string;
}) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const toggleDay = (day: number) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const isSelected = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(day)}
            className={cn(
              'w-10 h-10 rounded-lg text-xs font-bold transition-all border flex items-center justify-center',
              isSelected
                ? 'border-transparent text-white shadow-md'
                : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100',
            )}
            style={
              isSelected
                ? {
                    backgroundColor: selectedColor,
                  }
                : {}
            }
          >
            {day}
          </button>
        );
      })}
    </div>
  );
};
