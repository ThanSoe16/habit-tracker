'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Flex } from '@radix-ui/themes';
import { Check, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { HabitSheetBody, HabitSheetButton, HabitSheetHeader } from './habit-sheet-layout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  habitCompletionRemarksSchema,
  type Habit,
  type HabitCompletionRemarks,
} from '@/features/habits/types';
import { assertIdentityRevision, identityRevision } from '@/lib/supabase/identity-scope';
import { useHabitStore } from '@/store/use-habit-store';

type HabitCompleteSheetProps = {
  habit: Habit;
  dateString: string;
  onClose: () => void;
};

export function HabitCompleteSheet({ habit, dateString, onClose }: HabitCompleteSheetProps) {
  const completeHabit = useHabitStore((state) => state.completeHabit);
  const [accountRevision] = useState(identityRevision);
  const submitting = useRef(false);
  const entry = habit.history[dateString];
  const form = useForm<HabitCompletionRemarks>({
    resolver: zodResolver(habitCompletionRemarksSchema),
    defaultValues: { notes: typeof entry === 'object' ? entry.notes || '' : '' },
  });
  const pending = form.formState.isSubmitting;

  async function onSubmit(values: HabitCompletionRemarks) {
    if (submitting.current) return;
    submitting.current = true;
    form.clearErrors('root');
    try {
      assertIdentityRevision(accountRevision);
      await completeHabit(habit.id, dateString, values.notes);
    } catch {
      form.setError('root.server', {
        message: 'Could not save your completion. Your remarks are kept. Please try again.',
      });
      return;
    } finally {
      submitting.current = false;
    }
    toast.success('Habit completed');
    onClose();
  }

  return (
    <Drawer
      open
      dismissible={!pending}
      onOpenChange={(open) => {
        if (!open && !submitting.current) onClose();
      }}
    >
      <DrawerContent>
        <HabitSheetBody>
          <HabitSheetHeader
            title={habit.name}
            description={
              habit.habitKind === 'quit'
                ? 'Confirm you avoided this habit and add any remarks.'
                : 'Add any remarks before completing this habit.'
            }
          />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} aria-busy={pending}>
              <Flex direction="column" className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Remarks (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="How did it go?"
                          disabled={pending}
                          className="min-h-32 resize-none rounded-2xl p-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.formState.errors.root?.server && (
                  <p role="alert" className="text-sm text-destructive">
                    {form.formState.errors.root.server.message}
                  </p>
                )}
                <Flex align="center" className="flex w-full items-center gap-2">
                  <HabitSheetButton
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={onClose}
                    className="min-w-0 flex-1"
                  >
                    Cancel
                  </HabitSheetButton>
                  <HabitSheetButton type="submit" disabled={pending} className="min-w-0 flex-1">
                    {pending ? 'Saving…' : 'Complete'}
                  </HabitSheetButton>
                </Flex>
              </Flex>
            </form>
          </Form>
        </HabitSheetBody>
      </DrawerContent>
    </Drawer>
  );
}
