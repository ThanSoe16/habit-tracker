import { cn } from '@/utils/cn';

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
    <div className="bg-gray-200/70 dark:bg-zinc-800/80 p-1.5 rounded-2xl flex gap-1">
      {options.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => setValue(t.value)}
          className={cn(
            'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all capitalize',
            value === t.value
              ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/25'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};
