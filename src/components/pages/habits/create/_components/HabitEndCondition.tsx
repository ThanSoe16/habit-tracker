import React from "react";
import { ChevronRight, Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils/cn";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format } from "date-fns";

interface HabitEndConditionProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  mode: "date" | "days";
  setMode: (mode: "date" | "days") => void;
  date: string;
  setDate: (date: string) => void;
  days: number;
  setDays: (days: number) => void;
}

export const HabitEndCondition: React.FC<HabitEndConditionProps> = ({
  enabled,
  setEnabled,
  mode,
  setMode,
  date,
  setDate,
  days,
  setDays,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-gray-800 text-[15px] font-bold">
          End Habit on
        </Label>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      {enabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-gray-100 p-1 rounded-2xl flex">
            {(["date", "days"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize",
                  mode === m ? "bg-primary text-white" : "text-gray-500",
                )}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {mode === "date" ? (
                  <div className="text-primary text-xs">📅</div>
                ) : (
                  <ChevronRight className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1">
                {mode === "date" ? (
                  <DatePicker
                    date={date ? parseISO(date) : undefined}
                    onChange={(newDate) => {
                      if (newDate) {
                        setDate(format(newDate, "yyyy-MM-dd"));
                      }
                    }}
                    className="bg-transparent border-none p-0 h-auto shadow-none text-[15px] font-bold text-gray-700 hover:bg-transparent"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-gray-700">
                      After
                    </span>
                    <input
                      type="number"
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                      className="bg-gray-100 rounded-lg px-2 py-1 w-20 text-[15px] font-bold text-gray-700 focus:outline-none"
                    />
                    <span className="text-[15px] font-bold text-gray-700">
                      days
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Pencil className="w-4 h-4 text-gray-300 shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
};
