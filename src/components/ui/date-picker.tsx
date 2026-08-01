'use client';

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/utils/cn';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  value?: string; // YYYY-MM-DD
  onChange?: (date: any) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
}: DatePickerProps) {
  const selectedDate = value ? parseISO(value) : date;

  const handleSelect = (d?: Date) => {
    if (!onChange) return;
    if (value !== undefined) {
      onChange(d ? format(d, 'yyyy-MM-dd') : '');
    } else {
      onChange(d);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-xs font-extrabold border border-gray-200 dark:border-zinc-700 flex items-center justify-between text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700/60 transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30',
            !selectedDate && 'text-gray-400 font-bold',
            className,
          )}
        >
          <span className="truncate">
            {selectedDate ? format(selectedDate, 'PPP') : placeholder}
          </span>
          <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-[150] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-2xl"
        align="start"
        side="bottom"
        sideOffset={6}
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
