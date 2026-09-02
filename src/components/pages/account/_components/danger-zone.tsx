'use client';

import { useState } from 'react';
import { useHabitStore } from '@/store/use-habit-store';
import { useMoodStore } from '@/store/use-mood-store';
import { Trash2 } from 'lucide-react';

export function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);
  const habitStore = useHabitStore();
  const clearMoodHistory = useMoodStore((state) => state.clearHistory);

  const handleReset = async () => {
    for (const habit of habitStore.habits) {
      await habitStore.removeHabit(habit.id);
    }
    await clearMoodHistory();
    setShowConfirm(false);
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
            Are you sure? This will delete all your habits, completions, and mood data.
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
