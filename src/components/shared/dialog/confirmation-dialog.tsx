'use client';

import React from 'react';
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
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onClose()}>
      <AlertDialogContent className="max-w-md p-6 rounded-3xl bg-card border-border">
        <AlertDialogHeader>
          <Flex align="center" gap="3" className="mb-2">
            {enableDeleteIcon && (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDelete ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500'}`}>
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

        <AlertDialogFooter className="mt-6 flex justify-end gap-3">
          <AlertDialogCancel
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl font-bold border-border"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onPress();
            }}
            disabled={isLoading}
            className={`rounded-xl font-bold ${isDelete ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
