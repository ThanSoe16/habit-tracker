'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Flex } from '@radix-ui/themes';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  desc: string;
  isDelete?: boolean;
  enableDeleteIcon?: boolean;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  error?: string | null;
  onPress: () => void;
}

export function ConfirmationDialog({
  open,
  onClose,
  title,
  desc,
  isDelete = true,
  enableDeleteIcon = true,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  onPress,
  error,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && !isLoading && onClose()}>
      <AlertDialogContent className="max-w-md p-6 rounded-3xl bg-card border-border">
        <AlertDialogHeader>
          <Flex align="center" gap="3" className="mb-2">
            {enableDeleteIcon && (
              <div
                className={cn(
                  'size-10 rounded-full flex items-center justify-center',
                  isDelete ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
                )}
              >
                {isDelete ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
            )}
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              {title}
            </AlertDialogTitle>
          </Flex>
          <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
            {desc}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter className="mt-6 flex justify-end gap-3">
          <AlertDialogCancel disabled={isLoading} className="rounded-xl font-bold border-border">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (!isLoading) onPress();
            }}
            disabled={isLoading}
            className={cn(
              'rounded-xl font-bold',
              isDelete
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                : 'bg-primary text-primary-foreground',
            )}
          >
            {isLoading ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
