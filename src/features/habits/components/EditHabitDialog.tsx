"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { parseISO, format } from "date-fns";
import { Habit, useHabitStore } from "@/store/useHabitStore";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";

const COLORS = [
  "#FF7F27", // Orange
  "#EF4444", // Red
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#D946EF", // Fuchsia
];

const EMOJIS = [
  "📚",
  "💪",
  "🧘",
  "🏃",
  "💧",
  "🍎",
  "😴",
  "📝",
  "🎯",
  "⏰",
  "🧠",
  "💊",
  "🌅",
  "🚶",
  "🎨",
  "🎵",
  "💰",
  "🧹",
  "🌱",
  "☕",
  "📖",
  "✍️",
  "🏋️",
  "🚴",
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

interface EditHabitDialogProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
}

// Inner form component that resets when key changes
function EditForm({ habit, onClose }: { habit: Habit; onClose: () => void }) {
  const { updateHabit, removeHabit } = useHabitStore();
  const [name, setName] = useState(habit.name);
  const [color, setColor] = useState(habit.color);
  const [emoji, setEmoji] = useState(habit.emoji || EMOJIS[0]);
  const [createdAt, setCreatedAt] = useState(habit.createdAt);
  const [startDate, setStartDate] = useState(
    habit.startDate || new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(habit.endDate || "");

  // If repeatDays is empty array, it means "Today Only" (repeat disabled)
  // If repeatDays is undefined (legacy), or has values, repeat is enabled
  const initialRepeatEnabled =
    habit.repeatDays === undefined ||
    (habit.repeatDays && habit.repeatDays.length > 0);

  const [repeatDaysEnabled, setRepeatDaysEnabled] =
    useState(initialRepeatEnabled);

  const [selectedDays, setSelectedDays] = useState<number[]>(
    habit.repeatDays && habit.repeatDays.length > 0 ? habit.repeatDays : [], // Start empty if it was disabled, user must select
  );

  const handleSubmit = () => {
    if (!name.trim()) return;

    // Determine which days to save
    let daysToSave: number[];
    if (!repeatDaysEnabled) {
      daysToSave = [];
    } else if (selectedDays.length === 0) {
      // If enabled but none selected, treat as "no repeat" (empty array)
      daysToSave = [];
    } else {
      daysToSave = selectedDays;
    }

    updateHabit(habit.id, {
      name,
      color,
      emoji,
      repeatDays: daysToSave,
      createdAt, // Save potential date update
      startDate,
      endDate: endDate || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this habit?")) {
      removeHabit(habit.id);
      onClose();
    }
  };

  const toggleDay = (index: number) => {
    if (selectedDays.includes(index)) {
      setSelectedDays(selectedDays.filter((d) => d !== index));
    } else {
      setSelectedDays([...selectedDays, index]);
    }
  };

  return (
    <div className="px-6 pb-8 space-y-6">
      {/* Emoji & Color Picker */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-lg"
          style={{ backgroundColor: color }}
        >
          {emoji}
        </div>

        {/* Color Picker */}
        <div className="flex justify-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "w-7 h-7 rounded-full transition-all",
                color === c
                  ? "ring-2 ring-offset-2 ring-gray-800 scale-110"
                  : "hover:scale-105",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Emoji Picker */}
        <div className="flex gap-2 overflow-x-auto pb-2 max-w-full scrollbar-hide">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all",
                emoji === e
                  ? "bg-gray-200 ring-2 ring-gray-800 scale-110"
                  : "bg-gray-100 hover:bg-gray-200 hover:scale-105",
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-muted-foreground font-medium pl-1"
          >
            Habit name
          </Label>
          <Input
            id="name"
            placeholder="Morning Meditations"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 rounded-2xl bg-white border-transparent shadow-sm px-4 text-lg font-semibold placeholder:font-normal placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label className="text-muted-foreground font-medium pl-1">
              Start Date
            </Label>
            <DatePicker
              date={startDate ? parseISO(startDate) : undefined}
              onChange={(date) =>
                setStartDate(date ? format(date, "yyyy-MM-dd") : "")
              }
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-muted-foreground font-medium pl-1">
              End Date
            </Label>
            <DatePicker
              date={endDate ? parseISO(endDate) : undefined}
              onChange={(date) =>
                setEndDate(date ? format(date, "yyyy-MM-dd") : "")
              }
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center pl-1 pr-1">
            <Label className="text-muted-foreground font-medium">
              Repeat days
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded-md border-muted text-primary focus:ring-primary w-5 h-5 cursor-pointer"
                checked={repeatDaysEnabled}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setRepeatDaysEnabled(isChecked);
                  if (isChecked) {
                    // If switching to repeat, default to all days if currently empty
                    if (selectedDays.length === 0) {
                      setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
                    }
                  } else {
                    // If switching to "today only", clear selection and update date to now
                    const today = new Date().toISOString().split("T")[0];
                    setSelectedDays([]);
                    setCreatedAt(new Date().toISOString());
                    setStartDate(today);
                  }
                }}
              />
            </div>
          </div>

          {repeatDaysEnabled && (
            <div className="flex justify-between px-1">
              {DAYS.map((day, i) => {
                // Convert UI index to JS day: M(0)->1, T(1)->2, ..., S(5)->6, S(6)->0
                const jsDayIndex = (i + 1) % 7;
                const isSelected = selectedDays.includes(jsDayIndex);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(jsDayIndex)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      isSelected
                        ? "bg-[#1A1A1A] text-white shadow-md translate-y-[-2px]"
                        : "bg-white text-muted-foreground hover:bg-white/80",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={handleDelete}
          variant="outline"
          className="h-14 px-6 rounded-full font-bold border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          Delete
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20 bg-[#FF7F27] hover:bg-[#FF7F27]/90 text-white disabled:opacity-50"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export function EditHabitDialog({
  habit,
  isOpen,
  onClose,
}: EditHabitDialogProps) {
  // Key forces form to reset when dialog opens with fresh habit data
  const formKey = isOpen ? `${habit.id}-open` : "closed";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-[425px] p-0 gap-0 overflow-hidden bg-background border-none rounded-[2rem]"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="p-6 pb-2 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit habit</h2>
          <DialogClose className="rounded-full bg-muted p-2 hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4 text-foreground" />
          </DialogClose>
        </div>

        <EditForm key={formKey} habit={habit} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
