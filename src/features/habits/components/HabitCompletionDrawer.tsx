"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Habit } from "@/store/useHabitStore";
import { X, Trash2, Pencil } from "lucide-react";
import { EditHabitDialog } from "./EditHabitDialog";

interface HabitCompletionDrawerProps {
  habit: Habit;
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    date: string,
    details: { timeTaken: string; notes: string },
  ) => void;
  onRemove: (id: string, date: string) => void;
}

// Inner form component that resets when key changes
function CompletionForm({
  habitId,
  dateString,
  initialTimeTaken,
  initialNotes,
  isCompleted,
  readOnly,
  onSave,
  onRemove,
  onClose,
}: {
  habitId: string;
  dateString: string;
  initialTimeTaken: string;
  initialNotes: string;
  isCompleted: boolean;
  readOnly: boolean;
  onSave: (
    id: string,
    date: string,
    details: { timeTaken: string; notes: string },
  ) => void;
  onRemove: (id: string, date: string) => void;
  onClose: () => void;
}) {
  const [timeTaken, setTimeTaken] = useState(initialTimeTaken);
  const [notes, setNotes] = useState(initialNotes);

  const handleSave = () => {
    onSave(habitId, dateString, { timeTaken, notes });
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
            <div className="bg-white rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium text-sm">
                  Time Taken
                </span>
                <span className="font-bold text-green-600">
                  {initialTimeTaken} mins
                </span>
              </div>
              {initialNotes && (
                <div>
                  <span className="text-muted-foreground font-medium text-sm">
                    Notes
                  </span>
                  <p className="text-sm mt-1">{initialNotes}</p>
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

  return (
    <div className="px-4 pb-8 space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="timeTaken"
          className="text-muted-foreground font-medium"
        >
          Time Taken
        </Label>
        <div className="relative">
          <Input
            id="timeTaken"
            type="number"
            min="0"
            placeholder="e.g. 30"
            value={timeTaken}
            onChange={(e) => setTimeTaken(e.target.value)}
            className="bg-white border-transparent rounded-xl h-12 pr-14"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
            mins
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-muted-foreground font-medium">
          Detail Description
        </Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Write something..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-white border-transparent rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
        />
      </div>

      <div className="flex gap-3">
        {isCompleted && (
          <Button
            onClick={handleRemove}
            variant="outline"
            className="h-12 rounded-full font-bold border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={!timeTaken.trim()}
          className="flex-1 h-12 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCompleted ? "Update" : "Finish"}
        </Button>
      </div>
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const dateString = date.toLocaleDateString("en-CA");
  const historyEntry = habit.history[dateString];
  const isCompleted =
    typeof historyEntry === "boolean" ? historyEntry : historyEntry?.completed;

  // Check if date is in the past (not today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  const isPastDate = selectedDate < today;

  // Get initial values from history
  const initialTimeTaken =
    typeof historyEntry === "object" ? historyEntry?.timeTaken || "" : "";
  const initialNotes =
    typeof historyEntry === "object" ? historyEntry?.notes || "" : "";

  // Key changes when drawer opens, causing form to reset with fresh initial values
  const formKey = isOpen ? `${habit.id}-${dateString}-open` : "closed";

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="bg-background rounded-t-[2rem]">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="flex justify-between items-center p-4">
              <div>
                <DrawerTitle className="text-xl font-bold">
                  {habit.name}
                </DrawerTitle>
                {isPastDate && (
                  <p className="text-xs text-muted-foreground">
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Pencil className="w-4 h-4 opacity-50" />
                </Button>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="w-5 h-5 opacity-50" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <CompletionForm
              key={formKey}
              habitId={habit.id}
              dateString={dateString}
              initialTimeTaken={initialTimeTaken}
              initialNotes={initialNotes}
              isCompleted={!!isCompleted}
              readOnly={isPastDate}
              onSave={onSave}
              onRemove={onRemove}
              onClose={onClose}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <EditHabitDialog
        habit={habit}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      />
    </>
  );
}
