import React, { useRef } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/utils/cn";
import { COLORS } from "@/features/habits/data";

export const HabitColorSelector = ({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const isCustomColor = !COLORS.includes(value);

  return (
    <div className="grid grid-cols-5 gap-y-3 gap-x-2">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setValue(c)}
          className={cn(
            "w-10 h-10 rounded-full transition-all flex items-center justify-center border-2 border-transparent",
            value === c && "border-white shadow-xl scale-110",
          )}
          style={{ backgroundColor: c }}
        >
          {value === c && <Check className="w-5 h-5 text-white" />}
        </button>
      ))}

      <div className="relative">
        <input
          type="color"
          ref={colorInputRef}
          className="absolute inset-0 opacity-0 w-10 h-10 cursor-pointer"
          onChange={(e) => setValue(e.target.value)}
          value={isCustomColor ? value : "#FFFFFF"}
        />
        <button
          type="button"
          onClick={() => colorInputRef.current?.click()}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border transition-all overflow-hidden",
            isCustomColor
              ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-lg"
              : "bg-gray-50 border-gray-100 hover:bg-gray-100",
          )}
          style={isCustomColor ? { backgroundColor: value } : {}}
        >
          {isCustomColor ? (
            <Check className="w-5 h-5 text-white drop-shadow-sm" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-linear-to-tr from-red-500 via-green-500 to-blue-500 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white/80" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
