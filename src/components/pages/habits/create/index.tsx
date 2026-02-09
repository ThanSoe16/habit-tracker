"use client";

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useHabitStore } from "@/store/useHabitStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format } from "date-fns";

// Sub-components
import { HabitTypeToggle } from "./_components/HabitTypeToggle";
import { HabitIconSelector } from "./_components/HabitIconSelector";
import { HabitColorSelector } from "./_components/HabitColorSelector";
import { HabitRepeatSection } from "./_components/HabitRepeatSection";
import { HabitTimeSelector } from "./_components/HabitTimeSelector";
import { HabitEndCondition } from "./_components/HabitEndCondition";
import { HabitReminder } from "./_components/HabitReminder";

const COLORS = [
  "#FF7F27",
  "#EF4444",
  "#EAB308",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
  "#8B5CF6",
  "#D946EF",
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
];

export default function CreateHabitPage() {
  const router = useRouter();
  const { addHabit } = useHabitStore();

  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [type, setType] = useState<"habit" | "task">("habit");
  const [frequencyTab, setFrequencyTab] = useState<
    "daily" | "weekly" | "monthly" | "specific"
  >("daily");

  // Data states
  const [selectedDays, setSelectedDays] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 0,
  ]);
  const [selectedMonthlyDays, setSelectedMonthlyDays] = useState<number[]>([]);
  const [selectedSpecificDates, setSelectedSpecificDates] = useState<string[]>(
    [],
  );
  const [weeklyCount, setWeeklyCount] = useState(1);

  // UI states
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [allDay, setAllDay] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<
    "morning" | "afternoon" | "evening"
  >("morning");

  // End condition states
  const [endHabitEnabled, setEndHabitEnabled] = useState(false);
  const [endHabitMode, setEndHabitMode] = useState<"date" | "days">("date");
  const [endHabitDate, setEndHabitDate] = useState("2026-12-31");
  const [endHabitDays, setEndHabitDays] = useState(365);

  // Reminder states
  const [reminders, setReminders] = useState(false);
  const [reminderTime] = useState("07:00 AM");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit(
      name,
      color,
      frequencyTab,
      frequencyTab === "daily"
        ? selectedDays
        : frequencyTab === "monthly"
          ? selectedMonthlyDays
          : [],
      emoji,
      startDate,
      undefined,
      type,
      timeOfDay,
      reminders ? reminderTime : undefined,
      endHabitEnabled && endHabitMode === "date" ? endHabitDate : undefined,
      endHabitEnabled && endHabitMode === "days" ? endHabitDays : undefined,
      frequencyTab === "specific" ? selectedSpecificDates : undefined,
    );

    router.back();
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white z-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Create New Habit</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex-1 px-6 pt-6 pb-20 space-y-8 overflow-y-auto no-scrollbar"
      >
        <HabitTypeToggle type={type} setType={setType} />

        <div className="space-y-2">
          <Label className="text-gray-800 text-[15px] font-bold">
            Habit Name
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Study Art"
            className="h-14 rounded-2xl bg-gray-50 border-none shadow-none text-[17px] font-bold focus:bg-gray-100 transition-colors"
            required
          />
        </div>

        <HabitIconSelector selectedEmoji={emoji} onSelect={setEmoji} />

        <HabitColorSelector selectedColor={color} onSelect={setColor} />

        <div className="space-y-4">
          <Label className="text-gray-800 text-[15px] font-bold">
            Start Date
          </Label>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <div className="text-primary text-xs">🚀</div>
              </div>
              <div className="flex-1">
                <DatePicker
                  date={startDate ? parseISO(startDate) : undefined}
                  onChange={(newDate) => {
                    if (newDate) {
                      setStartDate(format(newDate, "yyyy-MM-dd"));
                    }
                  }}
                  className="bg-transparent border-none p-0 h-auto shadow-none text-[15px] font-bold text-gray-700 hover:bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <HabitRepeatSection
          frequencyTab={frequencyTab}
          setFrequencyTab={setFrequencyTab}
          selectedDays={selectedDays}
          setSelectedDays={setSelectedDays}
          selectedMonthlyDays={selectedMonthlyDays}
          setSelectedMonthlyDays={setSelectedMonthlyDays}
          selectedSpecificDates={selectedSpecificDates}
          setSelectedSpecificDates={setSelectedSpecificDates}
          weeklyCount={weeklyCount}
          setWeeklyCount={setWeeklyCount}
          allDay={allDay}
          setAllDay={setAllDay}
          currentViewDate={currentViewDate}
          setCurrentViewDate={setCurrentViewDate}
        />

        <HabitTimeSelector timeOfDay={timeOfDay} setTimeOfDay={setTimeOfDay} />

        <HabitEndCondition
          enabled={endHabitEnabled}
          setEnabled={setEndHabitEnabled}
          mode={endHabitMode}
          setMode={setEndHabitMode}
          date={endHabitDate}
          setDate={setEndHabitDate}
          days={endHabitDays}
          setDays={setEndHabitDays}
        />

        <HabitReminder
          enabled={reminders}
          setEnabled={setReminders}
          time={reminderTime}
        />

        <div className="pt-4 pb-10">
          <Button
            type="submit"
            className="w-full h-14 rounded-full text-[17px] font-bold shadow-xl transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white shadow-primary/20"
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
