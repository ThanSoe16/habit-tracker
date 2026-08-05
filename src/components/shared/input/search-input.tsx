'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export function SearchInput({ placeholder = 'Search...', className = '', ...props }: SearchInputProps) {
  return (
    <div className="relative flex items-center w-full max-w-xs">
      <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder={placeholder}
        className={`pl-9 h-10 rounded-xl bg-muted/50 border-border text-sm font-medium ${className}`}
        {...props}
      />
    </div>
  );
}
