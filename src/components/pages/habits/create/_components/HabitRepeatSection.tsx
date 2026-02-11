import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils/cn";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  getDaysInMonth,
  getDay,
} from "date-fns";
import { useFormContext } from "react-hook-form";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export const HabitRepeatSection: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const frequencyTab = watch("frequencyTab");
  const selectedDays = watch("selectedDays");
  const selectedMonthlyDays = watch("selectedMonthlyDays");
  const selectedSpecificDates = watch("selectedSpecificDates");
  const allDay = watch("allDay");

  // UI state for calendar navigation
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  const toggleDay = (index: number) => {
    if (selectedDays.includes(index)) {
      setValue(
        "selectedDays",
        selectedDays.filter((d: number) => d !== index),
      );
    } else {
      setValue("selectedDays", [...selectedDays, index]);
    }
  };

  const toggleMonthlyDay = (day: number) => {
    if (selectedMonthlyDays.includes(day)) {
      setValue(
        "selectedMonthlyDays",
        selectedMonthlyDays.filter((d: number) => d !== day),
      );
    } else {
      setValue(
        "selectedMonthlyDays",
        [...selectedMonthlyDays, day].sort((a: number, b: number) => a - b),
      );
    }
  };

  const toggleSpecificDate = (day: number) => {
    const dayStr = day.toString().padStart(2, "0");
    const dateStr = format(currentViewDate, `yyyy-MM-${dayStr}`);
    if (selectedSpecificDates.includes(dateStr)) {
      setValue(
        "selectedSpecificDates",
        selectedSpecificDates.filter((d: string) => d !== dateStr),
      );
    } else {
      setValue(
        "selectedSpecificDates",
        [...selectedSpecificDates, dateStr].sort(),
      );
    }
  };

  const resetData = (tab: "daily" | "monthly" | "specific") => {
    setValue("frequencyTab", tab);
    setValue("selectedDays", [1, 2, 3, 4, 5, 6, 0]);
    setValue("selectedMonthlyDays", []);
    setValue("selectedSpecificDates", []);
  };

  return (
    <div className="space-y-4">
      <Label className="text-gray-800 text-[15px] font-bold">Repeat</Label>
      <div className="bg-gray-100 p-1.5 rounded-2xl flex overflow-x-auto no-scrollbar gap-1">
        {(["daily", "monthly", "specific"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => resetData(tab)}
            className={cn(
              "flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all capitalize whitespace-nowrap",
              frequencyTab === tab
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {tab === "specific" ? "Specific Days" : tab}
          </button>
        ))}
      </div>

      {frequencyTab === "daily" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-800">
              On these day:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold">All day</span>
              <Switch
                checked={allDay}
                onCheckedChange={(val) => setValue("allDay", val)}
                className="data-[state=checked]:bg-primary"
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
                      ? "bg-primary text-white shadow-md shadow-primary/20"
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

      {(frequencyTab === "monthly" || frequencyTab === "specific") && (
        <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-2">
            <button
              type="button"
              onClick={() => setCurrentViewDate(subMonths(currentViewDate, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-gray-800">
              {format(currentViewDate, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setCurrentViewDate(addMonths(currentViewDate, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-7 text-center">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                <span key={d} className="text-[10px] font-bold text-gray-300">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-2">
              {Array.from({
                length: (getDay(startOfMonth(currentViewDate)) + 6) % 7,
              }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from(
                { length: getDaysInMonth(currentViewDate) },
                (_, i) => i + 1,
              ).map((day) => {
                const dayStr = day.toString().padStart(2, "0");
                const dateStr = format(currentViewDate, `yyyy-MM-${dayStr}`);
                const isSelected =
                  frequencyTab === "monthly"
                    ? selectedMonthlyDays.includes(day)
                    : selectedSpecificDates.includes(dateStr);
                return (
                  <div key={day} className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        frequencyTab === "monthly"
                          ? toggleMonthlyDay(day)
                          : toggleSpecificDate(day)
                      }
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        isSelected
                          ? "bg-primary text-white shadow-md shadow-primary/20 scale-110"
                          : "text-gray-400 hover:bg-gray-50",
                      )}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest pt-2 min-h-5">
            {frequencyTab === "monthly"
              ? selectedMonthlyDays.length > 0
                ? `Repeats on: ${selectedMonthlyDays.join(", ")}`
                : "Pick recurring dates"
              : selectedSpecificDates.length > 0
                ? `${selectedSpecificDates.length} specific dates selected`
                : "Pick any dates from the calendar"}
          </div>
        </div>
      )}
    </div>
  );
};
