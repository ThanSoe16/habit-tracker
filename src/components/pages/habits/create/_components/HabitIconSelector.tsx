import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";
import { useFormContext } from "react-hook-form";

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

export const HabitIconSelector: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const selectedEmoji = watch("emoji");

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-gray-800 text-[15px] font-bold">Icon</Label>
        <button
          type="button"
          className="text-primary text-xs font-bold flex items-center gap-1"
        >
          View All <span className="text-[10px]">→</span>
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setValue("emoji", e)}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all border shrink-0",
              selectedEmoji === e
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/30"
                : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100",
            )}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
};
