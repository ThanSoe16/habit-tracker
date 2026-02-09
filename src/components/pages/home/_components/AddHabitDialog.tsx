"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Check,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { parseISO, format } from "date-fns";
import { Pencil, Clock } from "lucide-react";
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
  const [reminderTime, setReminderTime] = useState("07:00 AM");
  const [type, setType] = useState<"habit" | "task">("habit");
  const [frequencyTab, setFrequencyTab] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [timeOfDay, setTimeOfDay] = useState<
    "morning" | "afternoon" | "evening"
  >("morning");
  const [endHabitEnabled, setEndHabitEnabled] = useState(false);
  const [endHabitMode, setEndHabitMode] = useState<"date" | "days">("date");
  const [endHabitDate, setEndHabitDate] = useState("2025-12-31");
  const [endHabitDays, setEndHabitDays] = useState(365);
  const [allDay, setAllDay] = useState(true);

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
      type,
      timeOfDay,
      reminders ? reminderTime : undefined,
      endHabitEnabled && endHabitMode === "date" ? endHabitDate : undefined,
      endHabitEnabled && endHabitMode === "days" ? endHabitDays : undefined,
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
    setReminderTime("07:00 AM");
    setType("habit");
    setFrequencyTab("daily");
    setTimeOfDay("morning");
    setEndHabitEnabled(false);
    setEndHabitMode("date");
    setAllDay(true);
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
        <div className="p-6 pb-2 relative flex items-center justify-center">
          <button
            onClick={() => setOpen(false)}
            className="absolute left-6 top-7 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">Create New Habit</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 pb-8 space-y-8 overflow-y-auto max-h-[85vh] no-scrollbar"
        >
          {/* Type Toggle */}
          <div className="bg-gray-100 p-1 rounded-2xl flex">
            <button
              type="button"
              onClick={() => setType("habit")}
              className={cn(
                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                type === "habit"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              Regular Habit
            </button>
            <button
              type="button"
              onClick={() => setType("task")}
              className={cn(
                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                type === "task"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              One-Time Task
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-800 text-[15px] font-bold">
              Habit Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Study Art"
              className="h-14 rounded-2xl bg-gray-50 border-none shadow-none text-[17px] font-bold"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-gray-800 text-[15px] font-bold">
                Icon
              </Label>
              <button
                type="button"
                className="text-indigo-500 text-xs font-bold flex items-center gap-1"
              >
                View All <span className="text-[10px]">→</span>
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {EMOJIS.slice(0, 5).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all border shrink-0",
                    emoji === e
                      ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100",
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-3">
            <Label className="text-gray-800 text-[15px] font-bold">Color</Label>
            <div className="grid grid-cols-5 gap-y-3 gap-x-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-all flex items-center justify-center border-2 border-transparent",
                    color === c && "border-white shadow-xl scale-110",
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-5 h-5 text-white" />}
                </button>
              ))}
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-linear-to-tr from-red-500 via-green-500 to-blue-500" />
              </button>
            </div>
          </div>

          {/* Repeat Section */}
          <div className="space-y-4">
            <Label className="text-gray-800 text-[15px] font-bold">
              Repeat
            </Label>
            <div className="bg-gray-100 p-1 rounded-2xl flex">
              {(["daily", "weekly", "monthly"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFrequencyTab(tab)}
                  className={cn(
                    "flex-1 py-2 text-sm font-bold rounded-xl transition-all capitalize",
                    frequencyTab === tab
                      ? "bg-white text-indigo-500 shadow-sm"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Daily UI */}
            {frequencyTab === "daily" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-800">
                    On these day:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold">
                      All day
                    </span>
                    <Checkbox
                      checked={allDay}
                      onCheckedChange={(checked) => setAllDay(!!checked)}
                      className="rounded-md border-gray-200 data-[state=checked]:bg-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                  {DAYS.map((day, i) => {
                    const jsDayIndex = (i + 1) % 7;
                    const isSelected = selectedDays.includes(jsDayIndex);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(jsDayIndex)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                          isSelected
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                            : "text-gray-400",
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weekly UI */}
            {frequencyTab === "weekly" && (
              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-800">
                  5 days per week
                </p>
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all",
                        num === 5
                          ? "bg-indigo-500 border-indigo-500 text-white shadow-lg"
                          : "bg-white border-gray-100 text-gray-400",
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly UI */}
            {frequencyTab === "monthly" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-4 space-y-4">
                <p className="text-xs font-bold text-gray-500 text-center">
                  Every month on 3, 8, 13, 17, 22, 27, 31
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 text-center">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                      <span
                        key={d}
                        className="text-[10px] font-bold text-gray-300"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-2">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <div
                        key={day}
                        className="flex items-center justify-center"
                      >
                        <button
                          type="button"
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                            [3, 8, 13, 17, 22, 27, 31].includes(day)
                              ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                              : "text-gray-400",
                          )}
                        >
                          {day}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Selector */}
          <div className="space-y-4">
            <Label className="text-gray-800 text-[15px] font-bold">
              Do it at:
            </Label>
            <div className="flex gap-2">
              {(["morning", "afternoon", "evening"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeOfDay(t)}
                  className={cn(
                    "flex-1 py-3 text-xs font-bold rounded-full border transition-all capitalize",
                    timeOfDay === t
                      ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-white border-gray-100 text-gray-400",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* End Habit Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-gray-800 text-[15px] font-bold">
                End Habit on
              </Label>
              <Switch
                checked={endHabitEnabled}
                onCheckedChange={setEndHabitEnabled}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>

            {endHabitEnabled && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-gray-100 p-1 rounded-2xl flex">
                  <button
                    type="button"
                    onClick={() => setEndHabitMode("date")}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                      endHabitMode === "date"
                        ? "bg-indigo-400 text-white"
                        : "text-gray-500",
                    )}
                  >
                    Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setEndHabitMode("days")}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                      endHabitMode === "days"
                        ? "bg-indigo-400 text-white"
                        : "text-gray-500",
                    )}
                  >
                    Days
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                      {endHabitMode === "date" ? (
                        <CalendarIcon className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                    <span className="text-[15px] font-bold text-gray-700">
                      {endHabitMode === "date"
                        ? "December 31, 2025"
                        : "After 365 days"}
                    </span>
                  </div>
                  <button type="button" className="text-gray-400">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reminder Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-gray-800 text-[15px] font-bold">
                Set Reminder
              </Label>
              <Switch
                checked={reminders}
                onCheckedChange={setReminders}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>

            {reminders && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span className="text-[15px] font-bold text-gray-700">
                    {reminderTime}
                  </span>
                </div>
                <button type="button" className="text-gray-400">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-full text-[17px] font-bold shadow-xl transition-all active:scale-[0.98] mt-4 bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20"
          >
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
