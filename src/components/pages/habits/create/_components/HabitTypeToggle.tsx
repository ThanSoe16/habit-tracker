import React from "react";
import { cn } from "@/utils/cn";
import { useFormContext } from "react-hook-form";

export const HabitTypeToggle: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const type = watch("type");

  return (
    <div className="bg-gray-100 p-1 rounded-2xl flex">
      {(["habit", "task"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setValue("type", t)}
          className={cn(
            "flex-1 py-3 text-sm font-bold rounded-xl transition-all capitalize",
            type === t
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          {t === "habit" ? "Regular Habit" : "One-Time Task"}
        </button>
      ))}
    </div>
  );
};
