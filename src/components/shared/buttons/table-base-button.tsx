'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, Trash2, Ban } from 'lucide-react';

interface TableBaseButtonProps {
  uiType: 'edit' | 'details' | 'delete' | 'block';
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  className?: string;
}

export function TableBaseButton({
  uiType,
  onClick,
  title,
  disabled = false,
  className = '',
}: TableBaseButtonProps) {
  const getIcon = () => {
    switch (uiType) {
      case 'edit':
        return <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'details':
        return <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-destructive" />;
      case 'block':
        return <Ban className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      title={title || uiType}
      className={`w-8 h-8 rounded-lg hover:bg-muted/80 ${className}`}
    >
      {getIcon()}
    </Button>
  );
}

export default TableBaseButton;
