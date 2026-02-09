import React from "react";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";

interface HabitColorSelectorProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

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

export const HabitColorSelector: React.FC<HabitColorSelectorProps> = ({
  selectedColor,
  onSelect,
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-gray-800 text-[15px] font-bold">Color</Label>
      <div className="grid grid-cols-5 gap-y-3 gap-x-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onSelect(c)}
            className={cn(
              "w-10 h-10 rounded-full transition-all flex items-center justify-center border-2 border-transparent",
              selectedColor === c && "border-white shadow-xl scale-110",
            )}
            style={{ backgroundColor: c }}
          >
            {selectedColor === c && <Check className="w-5 h-5 text-white" />}
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
  );
};
