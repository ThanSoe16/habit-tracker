"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHabitStore } from "@/store/useHabitStore";
import { Check } from "lucide-react";
import { parseISO, format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/utils/cn";

import { NewHabitHeader } from "./_components/NewHabitHeader";
import { NewHabitGraphic } from "./_components/NewHabitGraphic";

export default function NewHabit() {
  const router = useRouter();
  const { addHabit } = useHabitStore();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");

  const [repeatDays, setRepeatDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [hasRepeat, setHasRepeat] = useState(true); // Checkbox for repeat

  const [hasReminders, setHasReminders] = useState(false);

  const DAYS = [
    { label: "M", index: 1 },
    { label: "T", index: 2 },
    { label: "W", index: 3 },
    { label: "T", index: 4 },
    { label: "F", index: 5 },
    { label: "S", index: 6 },
    { label: "S", index: 0 },
  ];

  const toggleDay = (index: number) => {
    if (repeatDays.includes(index)) {
      setRepeatDays(repeatDays.filter((d) => d !== index));
    } else {
      setRepeatDays([...repeatDays, index]);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    // If repeat is unchecked, it's a one-off habit on the startDate.
    const finalDays = hasRepeat ? repeatDays : [];

    addHabit(
      name,
      "#FF7F27", // Default orange for now
      "daily",
      finalDays,
      undefined,
      startDate,
      endDate || undefined,
    );
    router.back();
  };

  return (
    <main className="h-screen bg-background text-foreground font-sans flex flex-col overflow-y-auto no-scrollbar">
      <div className="container max-w-md mx-auto px-6 pt-6 pb-24 flex-1 flex flex-col">
        <NewHabitHeader />

        <NewHabitGraphic />

        <div className="space-y-8">
          {/* Name Input */}
          <div className="space-y-3">
            <label className="text-gray-600 text-sm font-medium">
              Name your habit
            </label>
            <div className="group relative">
              <input
                type="text"
                placeholder="Morning Meditations"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 rounded-2xl bg-white px-4 text-base font-semibold shadow-sm border-none focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-3">
              <label className="text-gray-600 text-sm font-medium">
                Start Date
              </label>
              <DatePicker
                date={startDate ? parseISO(startDate) : undefined}
                onChange={(date) =>
                  setStartDate(date ? format(date, "yyyy-MM-dd") : "")
                }
              />
            </div>
            <div className="flex-1 space-y-3">
              <label className="text-gray-600 text-sm font-medium">
                End Date
              </label>
              <DatePicker
                date={endDate ? parseISO(endDate) : undefined}
                onChange={(date) =>
                  setEndDate(date ? format(date, "yyyy-MM-dd") : "")
                }
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Repeat days */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-gray-600 text-sm font-medium">
                Repeat days
              </label>
              <button
                onClick={() => setHasRepeat(!hasRepeat)}
                className={cn(
                  "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
                  hasRepeat
                    ? "bg-white border-primary"
                    : "bg-transparent border-gray-400",
                )}
              >
                {hasRepeat && <Check className="w-4 h-4 text-primary" />}
              </button>
            </div>

            {hasRepeat && (
              <div className="flex flex-wrap justify-between items-center gap-2 bg-white rounded-2xl p-2 shadow-sm">
                {DAYS.map((d) => {
                  const isSelected = repeatDays.includes(d.index);
                  return (
                    <button
                      key={d.index}
                      onClick={() => toggleDay(d.index)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        isSelected
                          ? "bg-foreground text-white shadow-md scale-105"
                          : "bg-transparent text-foreground hover:bg-gray-100",
                      )}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Get reminders */}
          <div className="flex justify-between items-center">
            <label className="text-gray-600 text-sm font-medium">
              Get reminders
            </label>
            <button
              onClick={() => setHasReminders(!hasReminders)}
              className={cn(
                "w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out",
                hasReminders ? "bg-primary" : "bg-gray-300",
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out",
                  hasReminders ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-auto pt-10">
          <button
            onClick={handleSubmit}
            className="w-full h-14 bg-primary hover:bg-primary/80 active:scale-[0.98] text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center"
          >
            Save Habit
          </button>
        </div>
      </div>
    </main>
  );
}
