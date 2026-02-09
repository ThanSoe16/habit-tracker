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
    <div className="px-4 sm:px-6 pb-8 space-y-6 sm:space-y-8">
      {/* Emoji & Color Picker Section */}
      <div className="flex flex-col items-center gap-4 sm:gap-6 py-4 bg-muted/30 rounded-3xl border border-muted/50">
        <div className="relative group">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-3xl sm:text-4xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
            style={{
              backgroundColor: color,
              boxShadow: `0 20px 40px -10px ${color}40`,
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0) 100%)",
            }}
          >
            {emoji}
          </div>
          <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-white rounded-full p-1 shadow-md border border-muted">
            <div
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>

        <div className="w-full space-y-4 px-2 sm:px-4">
          {/* Color Picker */}
          <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-300 border-2",
                  color === c
                    ? "border-black scale-110 shadow-lg"
                    : "border-transparent hover:scale-110",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Emoji Picker - Responsive Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2 bg-white/50 p-2 rounded-2xl overflow-y-auto max-h-[120px] scrollbar-hide border border-muted/30">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl transition-all duration-200",
                  emoji === e
                    ? "bg-white shadow-md scale-110 ring-1 ring-black/5"
                    : "hover:bg-white/80",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-foreground/70 text-xs sm:text-sm font-semibold pl-1 tracking-wide"
          >
            HABIT NAME
          </Label>
          <Input
            id="name"
            placeholder="Morning Meditations"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 sm:h-16 rounded-2xl bg-muted/20 border-muted/50 shadow-none px-4 sm:px-5 text-lg sm:text-xl font-bold placeholder:font-normal placeholder:text-muted-foreground/30 focus-visible:ring-primary/20 focus-visible:bg-white transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-foreground/70 text-xs sm:text-sm font-semibold pl-1 tracking-wide">
              START DATE
            </Label>
            <div className="group">
              <DatePicker
                date={startDate ? parseISO(startDate) : undefined}
                onChange={(date) =>
                  setStartDate(date ? format(date, "yyyy-MM-dd") : "")
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs sm:text-sm font-semibold pl-1 tracking-wide">
              END DATE
            </Label>
            <DatePicker
              date={endDate ? parseISO(endDate) : undefined}
              onChange={(date) =>
                setEndDate(date ? format(date, "yyyy-MM-dd") : "")
              }
              placeholder="No end date"
            />
          </div>
        </div>

        <div className="bg-muted/20 rounded-3xl p-4 sm:p-5 border border-muted/50 space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-foreground/80 font-bold text-sm sm:text-base tracking-tight">
              Repeat days
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-muted/50 text-primary focus:ring-primary cursor-pointer accent-primary"
                checked={repeatDaysEnabled}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setRepeatDaysEnabled(isChecked);
                  if (isChecked) {
                    if (selectedDays.length === 0) {
                      setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
                    }
                  } else {
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
            <div className="flex justify-between items-center bg-white/50 p-1 rounded-2xl border border-muted/30">
              {DAYS.map((day, i) => {
                const jsDayIndex = (i + 1) % 7;
                const isSelected = selectedDays.includes(jsDayIndex);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(jsDayIndex)}
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-sm font-black transition-all duration-300",
                      isSelected
                        ? "bg-[#1A1A1A] text-white shadow-lg shadow-black/20 scale-105"
                        : "text-muted-foreground hover:bg-black/5",
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

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
        <Button
          type="button"
          onClick={handleDelete}
          variant="outline"
          className="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-8 rounded-2xl font-bold border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all order-2 sm:order-1"
        >
          Delete
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 w-full h-14 sm:h-16 rounded-2xl text-lg sm:text-xl font-bold shadow-2xl transition-all active:scale-[0.98] bg-linear-to-r from-primary to-primary/80 text-white disabled:opacity-50 order-1 sm:order-2"
          style={{
            boxShadow: "0 10px 30px -5px var(--primary)",
          }}
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
