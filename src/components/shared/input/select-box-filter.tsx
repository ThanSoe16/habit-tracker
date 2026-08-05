'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectBoxFilterProps {
  title?: string;
  selectParam?: string;
  value: string;
  arr: SelectOption[];
  onChange: (val: string) => void;
  className?: string;
}

export function SelectBoxFilter({
  title,
  value,
  arr,
  onChange,
  className = '',
}: SelectBoxFilterProps) {
  return (
    <Select value={value || 'ALL'} onValueChange={onChange}>
      <SelectTrigger className={`h-10 px-3 min-w-32 rounded-xl bg-muted/50 border-border text-xs font-bold text-foreground ${className}`}>
        <SelectValue placeholder={title || 'Select option'} />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        {arr.map((item) => (
          <SelectItem key={item.value} value={item.value} className="text-xs font-medium">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
