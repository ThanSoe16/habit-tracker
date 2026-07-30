'use client';

import { useState } from 'react';
import { Calendar, Trophy, Check, Trash2, Dumbbell, ChevronRight } from 'lucide-react';
import { useGymStore, WorkoutLog } from '@/store/useGymStore';

export function GymHistory() {
  const { history, deleteWorkoutLog } = useGymStore();
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);

  const logEntries = Object.values(history).sort((a, b) => (a.date < b.date ? 1 : -1));

  const totalWorkouts = logEntries.filter((l) => l.completed).length;
  const totalSetsDone = logEntries.reduce((acc, log) => {
    return acc + log.exercises.reduce((exAcc, ex) => exAcc + ex.completedSets, 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Completed Workouts
            </span>
            <span className="text-xl font-black text-gray-900 dark:text-white">
              {totalWorkouts}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Sets Done
            </span>
            <span className="text-xl font-black text-gray-900 dark:text-white">
              {totalSetsDone}
            </span>
          </div>
        </div>
      </div>

      {/* History Log List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
          Workout History Log ({logEntries.length})
        </h4>

        {logEntries.length === 0 ? (
          <div className="text-center py-10 px-4 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
            <Calendar className="w-8 h-8 mx-auto text-gray-300 dark:text-zinc-600 mb-2" />
            <p className="text-xs text-muted-foreground font-medium">No workout history logged yet.</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Complete your daily workout to build your history!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {logEntries.map((log) => {
              const completedCount = log.exercises.filter((e) => e.completed).length;
              return (
                <div
                  key={log.id || log.date}
                  onClick={() => setSelectedLog(log)}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 hover:bg-blue-50/70 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {log.dayTitle}
                        </h5>
                        {log.completed && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold">
                            Completed
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {log.date} • {completedCount}/{log.exercises.length} exercises
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-gray-100 dark:border-zinc-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {selectedLog.date}
                </span>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  {selectedLog.dayTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {selectedLog.notes && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold block mb-0.5">Notes:</span>
                {selectedLog.notes}
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Logged Exercises
              </span>
              {selectedLog.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white">{ex.name}</h5>
                    <span className="text-[11px] text-gray-500">
                      {ex.category} • Target {ex.targetSets} sets × {ex.targetReps}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {ex.completedSets}/{ex.targetSets} sets
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  deleteWorkoutLog(selectedLog.date);
                  setSelectedLog(null);
                }}
                className="w-full py-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold rounded-2xl text-xs hover:bg-red-100 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
