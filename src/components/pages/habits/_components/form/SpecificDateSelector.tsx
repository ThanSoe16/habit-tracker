import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, X } from 'lucide-react';

export const SpecificDateSelector = ({
  value,
  onChange,
  selectedColor,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  selectedColor?: string;
}) => {
  const selectedDates = value.map((d) => parseISO(d));

  const handleSelect = (dates: Date[] | undefined) => {
    if (dates) {
      onChange(dates.map((d) => format(d, 'yyyy-MM-dd')));
    } else {
      onChange([]);
    }
  };

  const removeDate = (dateStr: string) => {
    onChange(value.filter((d) => d !== dateStr));
  };

  return (
    <div className="space-y-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal h-12 rounded-xl bg-white border-transparent shadow-sm"
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
            <span>Select Dates</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="multiple" selected={selectedDates} onSelect={handleSelect} initialFocus />
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((dateStr) => (
            <div
              key={dateStr}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 bg-white"
              style={{ borderColor: selectedColor + '33' }}
            >
              <span>{format(parseISO(dateStr), 'MMM d, yyyy')}</span>
              <button
                type="button"
                onClick={() => removeDate(dateStr)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
