'use client';

import { useState } from 'react';
import { Drawer, DrawerContent, DrawerTitle, DrawerHeader } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Habit } from '@/store/use-habit-store';
import { Trash2, FastForward, X, RotateCcw, Plus, Minus } from 'lucide-react';

interface HabitCompletionDrawerProps {
  habit: Habit;
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    date: string,
    details: { timeTaken: string; count: string; notes: string },
  ) => void;
  onRemove: (id: string, date: string) => void;
}

// Inner form component that resets when key changes
function CompletionForm({
  habitId,
  dateString,
  initialTimeTaken,
  initialCount,
  initialNotes,
  isCompleted,
  readOnly,
  unitType,
  unit,
  goalValue,
  onSave,
  onRemove,
  onClose,
}: {
  habitId: string;
  dateString: string;
  initialTimeTaken: string;
  initialCount: string;
  initialNotes: string;
  isCompleted: boolean;
  readOnly: boolean;
  unitType?: 'simple' | 'duration' | 'time' | 'count';
  unit?: string;
  goalValue?: number;
  onSave: (
    id: string,
    date: string,
    details: { timeTaken: string; count: string; notes: string },
  ) => void;
  onRemove: (id: string, date: string) => void;
  onClose: () => void;
}) {
  const unitLabel = unit || (unitType === 'time' ? 'mins' : 'times');
  const [timeTaken, setTimeTaken] = useState(
    initialTimeTaken || (unitType === 'time' && goalValue ? String(goalValue) : ''),
  );
  const [count, setCount] = useState(
    initialCount || (unitType === 'count' && goalValue ? String(goalValue) : ''),
  );
  const [notes, setNotes] = useState(initialNotes);

  const handleSave = () => {
    onSave(habitId, dateString, { timeTaken, count, notes });
    onClose();
  };

  const handleRemove = () => {
    onRemove(habitId, dateString);
    onClose();
  };

  // Read-only view for past dates
  if (readOnly) {
    return (
      <div className="px-4 pb-8 space-y-4">
        {isCompleted ? (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b pb-3 border-gray-50 dark:border-zinc-800">
                <span className="text-muted-foreground font-medium text-sm">Completion Stats</span>
              </div>

              {initialTimeTaken && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Time Taken</span>
                  <span className="font-bold text-primary">{initialTimeTaken} mins</span>
                </div>
              )}

              {initialCount && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Count</span>
                  <span className="font-bold text-primary">{initialCount} times</span>
                </div>
              )}

              {initialNotes && (
                <div className="pt-2">
                  <span className="text-muted-foreground font-medium text-sm">Notes</span>
                  <p className="text-sm mt-1 bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
                    {initialNotes}
                  </p>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Past completions cannot be edited
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Not completed on this day</p>
            <p className="text-xs text-muted-foreground mt-1">
              Past dates cannot be marked as complete
            </p>
          </div>
        )}
      </div>
    );
  }

  const currentVal = parseInt(count || '0', 10);
  const targetGoal = goalValue || 1;
  const remainingVal = Math.max(0, targetGoal - currentVal);

  return (
    <div className="px-4 pb-8 space-y-6">
      {unitType === 'count' ? (
        <div className="flex flex-col items-center justify-center py-1 space-y-5">
          {/* Subtitle / Progress Note */}
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 -mt-3">
            Every day, {currentVal}/{targetGoal} {unitLabel}
          </p>

          {/* Circular Arc Gauge with Flanking - and + Buttons */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* Circular SVG Gauge */}
            <svg className="w-52 h-52 -rotate-90" viewBox="0 0 100 100">
              {/* Background Ring Track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-teal-200 dark:stroke-emerald-950/60"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Active Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-teal-500 transition-all duration-300"
                strokeWidth="7"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - 251.2 * Math.min(1, currentVal / targetGoal)}
              />
            </svg>

            {/* Big Center Number */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                {currentVal}
              </span>
            </div>

            {/* Left Flanking Minus (-) Button */}
            <button
              type="button"
              onClick={() => {
                setCount(String(Math.max(0, currentVal - 1)));
              }}
              className="absolute -left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-teal-50 dark:bg-emerald-950/80 text-teal-500 flex items-center justify-center font-bold text-2xl hover:scale-105 active:scale-95 transition-all shadow-xs"
            >
              <Minus className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Right Flanking Plus (+) Button */}
            <button
              type="button"
              onClick={() => {
                setCount(String(currentVal + 1));
              }}
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-teal-50 dark:bg-emerald-950/80 text-teal-500 flex items-center justify-center font-bold text-2xl hover:scale-105 active:scale-95 transition-all shadow-xs"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Bottom Action Bar */}
          <div className="w-full flex items-center justify-between pt-2">
            {/* Left Action Icons */}
            <div className="flex items-center gap-3">
              {/* Fast Forward Icon (Complete remaining) */}
              <button
                type="button"
                onClick={() => setCount(String(targetGoal))}
                className="p-2 text-teal-500 hover:bg-teal-50 dark:hover:bg-emerald-950/40 rounded-full transition-colors"
                title="Complete goal"
              >
                <FastForward className="w-5 h-5 fill-teal-500" />
              </button>
              {/* Close / Clear Icon */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-teal-500 hover:bg-teal-50 dark:hover:bg-emerald-950/40 rounded-full transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
              {/* Reset / Undo Icon */}
              <button
                type="button"
                onClick={() => setCount('0')}
                className="p-2 text-teal-500 hover:bg-teal-50 dark:hover:bg-emerald-950/40 rounded-full transition-colors"
                title="Reset count"
              >
                <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Main Action Pill Button */}
            <Button
              onClick={handleSave}
              type="button"
              className="py-3.5 px-8 rounded-full text-base font-black bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/30 active:scale-98 transition-all"
            >
              {remainingVal > 0 ? `+${remainingVal}` : 'Done'}
            </Button>
          </div>
        </div>
      ) : (
        /* Standard / Duration Form */
        <div className="space-y-4">
          {unitType === 'time' && (
            <div className="space-y-2">
              <Label htmlFor="timeTaken" className="text-muted-foreground font-medium ml-1">
                Time Spent
              </Label>
              <div className="relative">
                <Input
                  id="timeTaken"
                  type="number"
                  min="0"
                  placeholder="e.g. 30"
                  value={timeTaken}
                  onChange={(e) => setTimeTaken(e.target.value)}
                  className="bg-white border-transparent rounded-2xl h-14 pr-16 text-lg font-medium shadow-sm focus:ring-primary/20"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">
                  mins
                </span>
              </div>
              {goalValue && (
                <p className="text-xs text-muted-foreground px-2">Goal: {goalValue} mins</p>
              )}
            </div>
          )}

          {(unitType === 'simple' || !unitType) && (
            <div className="py-3 px-4 text-center bg-gray-50 dark:bg-zinc-800/60 rounded-2xl">
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                Mark this habit as completed for the day.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-muted-foreground font-medium ml-1">
              Notes
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="How did it go?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-700/60 rounded-2xl p-4 text-base focus:ring-emerald-500/20 outline-none resize-none shadow-xs"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleRemove}
              variant="outline"
              type="button"
              className="h-14 w-14 p-0 rounded-full font-bold border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0"
              title="Delete completion"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSave}
              type="button"
              className="flex-1 h-14 rounded-full text-base font-black bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/30 active:scale-98 transition-transform"
            >
              Update
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function HabitCompletionDrawer({
  habit,
  date,
  isOpen,
  onClose,
  onSave,
  onRemove,
}: HabitCompletionDrawerProps) {
  const dateString = date.toLocaleDateString('en-CA');
  const historyEntry = habit.history[dateString];
  const isCompleted = typeof historyEntry === 'boolean' ? historyEntry : historyEntry?.completed;

  // Check if date is in the past (not today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  const isPastDate = selectedDate < today;

  // Get initial values from history
  const initialTimeTaken = typeof historyEntry === 'object' ? historyEntry?.timeTaken || '' : '';
  const initialCount = typeof historyEntry === 'object' ? historyEntry?.count || '' : '';
  const initialNotes = typeof historyEntry === 'object' ? historyEntry?.notes || '' : '';

  // Key changes when drawer opens, causing form to reset with fresh initial values
  const formKey = isOpen ? `${habit.id}-${dateString}-open` : 'closed';

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="flex flex-col items-center pt-4 pb-2">
            <div className="text-center">
              <DrawerTitle className="text-2xl font-black tracking-tight">{habit.name}</DrawerTitle>
            </div>
          </DrawerHeader>

          <CompletionForm
            key={formKey}
            habitId={habit.id}
            dateString={dateString}
            initialTimeTaken={initialTimeTaken}
            initialCount={initialCount}
            initialNotes={initialNotes}
            isCompleted={!!isCompleted}
            readOnly={isPastDate}
            unitType={habit.unitType}
            unit={habit.unit}
            goalValue={habit.goalValue}
            onSave={onSave}
            onRemove={onRemove}
            onClose={onClose}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
