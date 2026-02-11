import { cn } from "@/utils/cn";
import { EMOJIS } from "@/features/habits/data";

export const HabitIconSelector = ({
  value,
  setValue,
  selectedColor,
  habitName,
}: {
  value: string;
  setValue: (value: string) => void;
  selectedColor?: string;
  habitName?: string;
}) => {
  const firstChar = habitName ? habitName.trim().charAt(0).toUpperCase() : "?";
  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setValue("")}
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold transition-all border shrink-0",
            value === ""
              ? "border-transparent text-white shadow-lg"
              : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100",
          )}
          style={
            value === ""
              ? {
                  backgroundColor: selectedColor,
                  boxShadow: selectedColor
                    ? `0 10px 15px -3px ${selectedColor}4D`
                    : undefined,
                }
              : {}
          }
        >
          {firstChar}
        </button>

        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setValue(e)}
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all border shrink-0",
              value === e
                ? "border-transparent text-white shadow-lg"
                : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100",
            )}
            style={
              value === e
                ? {
                    backgroundColor: selectedColor,
                    boxShadow: selectedColor
                      ? `0 10px 15px -3px ${selectedColor}4D`
                      : undefined,
                  }
                : {}
            }
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
};
