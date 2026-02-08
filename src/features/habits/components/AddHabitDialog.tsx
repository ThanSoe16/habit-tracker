"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { parseISO, format } from "date-fns";
import { useHabitStore, HabitFrequency } from "@/store/useHabitStore";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export function AddHabitDialog() {
  const { addHabit } = useHabitStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [color, setColor] = useState(COLORS[0]);
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [repeatDaysEnabled, setRepeatDaysEnabled] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 0,
  ]); // Start with all days selected (Daily)
  const [reminders, setReminders] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Determine which days to save based on repeat days checkbox
    let daysToSave: number[];

    console.log("Submit Debug:", { repeatDaysEnabled, selectedDays });

    if (!repeatDaysEnabled) {
      // Repeat days is UNCHECKED = today only, save empty array
      console.log("Repeat days DISABLED -> saving []");
      daysToSave = [];
    } else if (selectedDays.length === 0) {
      // Repeat days is CHECKED but no days selected -> treat as "Today Only" (no repeat)
      console.log("Repeat days ENABLED but none selected -> saving []");
      daysToSave = [];
    } else {
      // Repeat days is CHECKED with specific days selected
      console.log(
        "Repeat days ENABLED with selection -> saving selection:",
        selectedDays,
      );
      daysToSave = selectedDays;
    }

    addHabit(
      name,
      color,
      frequency,
      daysToSave,
      emoji,
      startDate,
      endDate || undefined,
    );
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setFrequency("daily");
    setColor(COLORS[0]);
    setEmoji(EMOJIS[0]);
    setRepeatDaysEnabled(true);
    setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
    setReminders(false);
  };

  const toggleDay = (index: number) => {
    if (selectedDays.includes(index)) {
      setSelectedDays(selectedDays.filter((d) => d !== index));
    } else {
      setSelectedDays([...selectedDays, index]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-2xl bg-[#545CEB] hover:bg-[#545CEB]/90 text-white p-0 flex items-center justify-center shrink-0 border-[3px] border-white/20"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 overflow-hidden bg-background border-none rounded-[2rem]">
        <div className="p-6 pb-2 flex items-center justify-between">
          <h2 className="text-2xl font-bold">New habit</h2>
          <DialogClose className="rounded-full bg-muted p-2 hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4 text-foreground" />
          </DialogClose>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-6">
          {/* Emoji & Color Picker */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-lg"
                style={{ backgroundColor: color }}
              >
                {emoji}
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 text-2xl">✨</div>
              <div className="absolute bottom-0 -left-4 text-xl rotate-12">
                ⚡️
              </div>
            </div>

            {/* Color Picker */}
            <div className="flex gap-2">
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
                Name your habit
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
                        setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
                      } else {
                        setSelectedDays([]);
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

            <div className="flex items-center justify-between pl-1 pt-2">
              <Label
                htmlFor="reminders"
                className="text-muted-foreground font-medium"
              >
                Get reminders
              </Label>
              <Switch
                id="reminders"
                checked={reminders}
                onCheckedChange={setReminders}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20 mt-4 bg-[#FF7F27] hover:bg-[#FF7F27]/90 text-white"
          >
            Save Habit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
