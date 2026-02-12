"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Habit } from "@/store/useHabitStore";
import { Trash2 } from "lucide-react";

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
  onSave: (
    id: string,
    date: string,
    details: { timeTaken: string; count: string; notes: string },
  ) => void;
  onRemove: (id: string, date: string) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"time" | "count">("time");
  const [timeTaken, setTimeTaken] = useState(initialTimeTaken);
  const [count, setCount] = useState(initialCount);
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
            <div className="bg-white rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b pb-3 border-gray-50">
                <span className="text-muted-foreground font-medium text-sm">
                  Completion Stats
                </span>
              </div>

              {initialTimeTaken && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">
                    Time Taken
                  </span>
                  <span className="font-bold text-primary">
                    {initialTimeTaken} mins
                  </span>
                </div>
              )}

              {initialCount && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Count</span>
                  <span className="font-bold text-primary">
                    {initialCount} times
                  </span>
                </div>
              )}

              {initialNotes && (
                <div className="pt-2">
                  <span className="text-muted-foreground font-medium text-sm">
                    Notes
                  </span>
                  <p className="text-sm mt-1 bg-gray-50 p-3 rounded-lg">
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

  return (
    <div className="px-4 pb-8 space-y-6">
      {/* Tab Switcher */}
      <div className="bg-gray-100 p-1 rounded-2xl flex">
        <button
          onClick={() => setActiveTab("time")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "time"
              ? "bg-white text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Time Taken
        </button>
        <button
          onClick={() => setActiveTab("count")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "count"
              ? "bg-white text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Count
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === "time" ? (
          <div className="space-y-2">
            <Label
              htmlFor="timeTaken"
              className="text-muted-foreground font-medium ml-1"
            >
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
          </div>
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor="count"
              className="text-muted-foreground font-medium ml-1"
            >
              Repeat Count
            </Label>
            <div className="relative">
              <Input
                id="count"
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="bg-white border-transparent rounded-2xl h-14 pr-16 text-lg font-medium shadow-sm focus:ring-primary/20"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">
                times
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="notes"
            className="text-muted-foreground font-medium ml-1"
          >
            Notes
          </Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="How did it go?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border-transparent rounded-2xl p-4 text-base focus:ring-primary/20 outline-none resize-none shadow-sm"
          />
        </div>
      </div>

      <div className="flex gap-3">
        {isCompleted && (
          <Button
            onClick={handleRemove}
            variant="outline"
            className="h-14 w-14 p-0 rounded-2xl font-bold border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={!timeTaken.trim() && !count.trim()}
          className="flex-1 h-14 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 disabled:opacity-50"
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
  const initialCount =
    typeof historyEntry === "object" ? historyEntry?.count || "" : "";
  const initialNotes =
    typeof historyEntry === "object" ? historyEntry?.notes || "" : "";

  // Key changes when drawer opens, causing form to reset with fresh initial values
  const formKey = isOpen ? `${habit.id}-${dateString}-open` : "closed";

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="bg-background rounded-t-[2.5rem]">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="flex flex-col items-center pt-4 pb-4">
              <div className="text-center">
                <DrawerTitle className="text-2xl font-black tracking-tight">
                  {habit.name}
                </DrawerTitle>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  {isPastDate
                    ? date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })
                    : "Complete your habit"}
                </p>
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
              onSave={onSave}
              onRemove={onRemove}
              onClose={onClose}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
