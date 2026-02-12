"use client";

import { useRef, useCallback } from "react";
import { Check, Clock, Flame } from "lucide-react";
import { cn } from "@/utils/cn";
import { Habit } from "@/store/useHabitStore";
import { getContrastColor } from "@/utils/colorUtils";

interface HabitCardProps {
  habit: Habit;
  date: Date;
  isLast?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
}

const LONG_PRESS_DURATION = 500; // ms

export function HabitCard({
  habit,
  date,
  isLast,
  onClick,
  onLongPress,
}: HabitCardProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  // Use local time date string to avoid timezone issues
  const dateString = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
  const historyEntry = habit.history[dateString];
  const isCompleted =
    typeof historyEntry === "boolean" ? historyEntry : historyEntry?.completed;
  const timeTaken =
    typeof historyEntry === "object" ? historyEntry?.timeTaken : undefined;
  const count =
    typeof historyEntry === "object" ? historyEntry?.count : undefined;

  const handleTouchStart = useCallback(() => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress?.();
    }, LONG_PRESS_DURATION);
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    // Only trigger click if it wasn't a long press
    if (!isLongPressRef.current) {
      onClick?.();
    }
    isLongPressRef.current = false;
  }, [onClick]);

  return (
    <div
      className="relative flex gap-3 items-center cursor-pointer select-none"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[8px] top-1/2 w-px h-full border-l border-dashed border-gray-200" />
      )}

      {/* Status Indicator (not clickable separately) */}
      <div className="relative z-10">
        <div
          className={cn(
            "w-4 h-4 rounded-full flex items-center justify-center transition-all shadow-sm border-2",
            isCompleted
              ? "text-white"
              : "bg-white border-muted text-transparent",
          )}
          style={
            isCompleted
              ? { backgroundColor: habit.color, borderColor: habit.color }
              : {}
          }
        >
          <Check className="w-2.5 h-2.5" strokeWidth={2} />
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 bg-white rounded-lg px-3 py-2.5 flex items-center justify-between border border-border/50 active:scale-[0.98] transition-transform">
        <div className="flex items-center gap-3">
          {/* Icon Box */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{
              backgroundColor: habit.color,
              color:
                getContrastColor(habit.color) === "black"
                  ? "#000000"
                  : "#FFFFFF",
            }}
          >
            {habit.emoji || habit.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="font-bold text-foreground text-sm">{habit.name}</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
              <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
              <span className="font-medium text-gray-500">
                Streak {habit.streak} days
              </span>
            </div>
          </div>
        </div>

        {isCompleted && (timeTaken || count) && (
          <div className="flex flex-col items-end gap-0.5">
            <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              {timeTaken ? (
                <Clock className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
            <span className="text-[10px] font-bold text-green-600">
              {timeTaken ? `${timeTaken} mins` : `${count} times`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
