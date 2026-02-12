"use client";

import React from "react";
import { Habit } from "@/store/useHabitStore";
import { cn } from "@/utils/cn";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MyHabitCardProps {
  habit: Habit;
  onClick?: () => void;
}

export function MyHabitCard({ habit, onClick }: MyHabitCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-sm border border-black/5",
        isDragging && "opacity-80 shadow-lg scale-[1.02]",
      )}
      {...attributes}
    >
      <div
        className="w-12 h-12 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform"
        style={{
          backgroundColor: habit.color + "40",
        }}
      >
        {habit.emoji || "✨"}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 truncate text-[17px]">
          {habit.name}
        </h3>
        {habit.type === "habit" && (
          <p className="text-gray-500 text-[13px] font-medium mt-0.5">
            Regular Habit
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-2 text-gray-400 opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
