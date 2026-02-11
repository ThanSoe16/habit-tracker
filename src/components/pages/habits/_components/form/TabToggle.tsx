import { cn } from "@/utils/cn";

export const TabToggle = ({
  value,
  setValue,
  options,
}: {
  value: string;
  setValue: (value: string) => void;
  options: { value: string; label: string }[];
}) => {
  return (
    <div className="bg-gray-100 p-1 rounded-xl flex">
      {options.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => setValue(t.value)}
          className={cn(
            "flex-1 py-3 text-xs font-bold rounded-lg transition-all capitalize",
            value === t.value
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};
