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
import { cn } from "@/utils/cn";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

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

    if (!repeatDaysEnabled) {
      // Repeat days is UNCHECKED = today only, save empty array
      daysToSave = [];
    } else if (selectedDays.length === 0) {
      // Repeat days is CHECKED but no days selected -> treat as "Today Only" (no repeat)
      daysToSave = [];
    } else {
      // Repeat days is CHECKED with specific days selected
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
          className="rounded-full w-14 h-14 shadow-2xl bg-blue-600 hover:bg-blue-600/90 text-white p-0 flex items-center justify-center shrink-0 border-[3px] border-white/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 bg-background border-none rounded-[2rem]">
        <div className="p-6 pb-2 flex items-center justify-between">
          <h2 className="text-2xl font-bold">New habit</h2>
          <DialogClose className="rounded-full bg-muted p-2 hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4 text-foreground" />
          </DialogClose>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-4 sm:px-6 pb-8 space-y-6 sm:space-y-8 overflow-y-auto max-h-[calc(100vh-250px)]"
        >
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

              {/* Emoji Picker - Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2 bg-white/50 p-2 rounded-2xl border border-muted/30">
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
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="bg-muted/20 rounded-3xl p-4 sm:p-5 border border-muted/50 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-foreground/80 font-bold text-sm sm:text-base tracking-tight">
                  Repeat days
                </Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={repeatDaysEnabled}
                    onCheckedChange={(checked) => {
                      const isChecked = !!checked;
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

            <div className="flex items-center justify-between pl-1 pt-2">
              <Label
                htmlFor="reminders"
                className="text-foreground/70 text-xs sm:text-sm font-semibold tracking-wide"
              >
                GET REMINDERS
              </Label>
              <Switch
                id="reminders"
                checked={reminders}
                onCheckedChange={setReminders}
                className="sm:scale-110 data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 sm:h-16 rounded-2xl text-lg sm:text-xl font-bold shadow-2xl transition-all active:scale-[0.98] mt-4 bg-linear-to-r from-primary to-primary/80 text-white"
            style={{
              boxShadow: "0 10px 30px -5px var(--primary)",
            }}
          >
            Save Habit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
