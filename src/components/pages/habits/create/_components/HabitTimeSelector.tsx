import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";
import { useFormContext } from "react-hook-form";

export const HabitTimeSelector: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const timeOfDay = watch("timeOfDay");

  return (
    <div className="space-y-4">
      <Label className="text-gray-800 text-[15px] font-bold">Do it at:</Label>
      <div className="flex gap-2">
        {(["morning", "afternoon", "evening"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setValue("timeOfDay", t)}
            className={cn(
              "flex-1 py-3 text-xs font-bold rounded-full border transition-all capitalize",
              timeOfDay === t
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                : "bg-white border-gray-100 text-gray-400",
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};
