"use client";

import { useState } from "react";
import { useHabitStore } from "@/store/useHabitStore";
import { Trash2 } from "lucide-react";

export function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);
  const habitStore = useHabitStore();

  const handleReset = () => {
    // Clear all habits
    habitStore.habits.forEach((h) => {
      habitStore.removeHabit(h.id);
    });

    // Clear mood history by setting empty
    // Since there's no clearAll, we'll clear localStorage directly
    if (typeof window !== "undefined") {
      localStorage.removeItem("habit-tracker-data");
      localStorage.removeItem("mood-tracker-storage");
      window.location.reload();
    }
  };

  return (
    <div className="mt-2">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-100 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Reset All Data
        </button>
      ) : (
        <div className="bg-red-50 rounded-2xl p-5 border border-red-100 space-y-3">
          <p className="text-sm font-semibold text-red-700 text-center">
            Are you sure? This will delete all your habits, completions, and
            mood data.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Delete Everything
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
