'use client';

import { Trash2 } from 'lucide-react';
import { Flex } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function WellbeingSettingsActions({
  saving,
  deleting,
  dirty,
  deleteOpen,
  setDeleteOpen,
  saveSettings,
  deleteHistory,
  onReset,
}: {
  saving: boolean;
  deleting: boolean;
  dirty: boolean;
  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  saveSettings: () => Promise<void>;
  deleteHistory: () => Promise<void>;
  onReset: () => void;
}) {
  return (
    <Flex direction="column" gap="3" className="w-full">
      <p role="status" className="text-sm text-muted-foreground">
        {saving
          ? 'Saving settings…'
          : dirty
            ? 'You have unsaved changes.'
            : 'Your settings are up to date.'}
      </p>
      <Flex gap="2" className="w-full">
        <Button
          disabled={!dirty || saving || deleting}
          className="flex-1"
          onClick={() => void saveSettings()}
        >
          {saving ? 'Saving…' : 'Save settings'}
        </Button>
        <Button variant="outline" disabled={!dirty || saving || deleting} onClick={onReset}>
          Cancel
        </Button>
      </Flex>
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleting) setDeleteOpen(open);
        }}
      >
        <AlertDialogTrigger asChild>
          <Button disabled={dirty || saving || deleting} variant="destructive" className="w-full">
            <Trash2 data-icon="inline-start" /> Delete wellbeing history
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete wellbeing history?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes recorded usage, focus sessions, insights, social sessions,
              and urges. Your goals and settings remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              variant="destructive"
              onClick={(event) => {
                event.preventDefault();
                void deleteHistory();
              }}
            >
              {deleting ? 'Deleting…' : 'Delete history'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
