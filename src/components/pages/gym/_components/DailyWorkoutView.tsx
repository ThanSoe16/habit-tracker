'use client';

import { useState, useEffect } from 'react';
import { Check, Plus, Minus, Trophy, Calendar, Sparkles, Dumbbell } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useGymStore } from '@/store/useGymStore';
import { getLocalDateString } from '@/utils/dateUtils';

interface DailyWorkoutViewProps {
  date?: Date;
  onGoToPlanEditor?: () => void;
}

export function DailyWorkoutView({ date = new Date(), onGoToPlanEditor }: DailyWorkoutViewProps) {
  const dateStr = getLocalDateString(date);
  const {
    getWorkoutLogForDate,
    initializeWorkoutLogForDate,
    updateCompletedSet,
    toggleExerciseDone,
    finishWorkout,
  } = useGymStore();

  const [notes, setNotes] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  // Initialize or fetch current log
  const log = getWorkoutLogForDate(dateStr) || initializeWorkoutLogForDate(dateStr);

  useEffect(() => {
    if (log && log.notes) {
      setNotes(log.notes);
    }
  }, [log]);

  if (!log || log.exercises.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
          <Dumbbell className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {log?.dayTitle || 'Rest Day'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            No planned exercises for today in your 7-day split. Take a rest or configure your plan!
          </p>
        </div>
        {onGoToPlanEditor && (
          <button
            onClick={onGoToPlanEditor}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
          >
            Customize 7-Day Plan
          </button>
        )}
      </div>
    );
  }

  const totalSetsTarget = log.exercises.reduce((acc, ex) => acc + ex.targetSets, 0);
  const totalSetsCompleted = log.exercises.reduce((acc, ex) => acc + ex.completedSets, 0);
  const progressPercent = totalSetsTarget > 0 ? Math.round((totalSetsCompleted / totalSetsTarget) * 100) : 0;

  const handleFinish = () => {
    finishWorkout(dateStr, notes);
    setShowCelebration(true);
  };

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/20 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-100 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm truncate max-w-[65%]" title={log.dayTitle}>
            {log.dayTitle}
          </span>
          <span className="text-xs font-semibold text-blue-100 flex items-center gap-1 shrink-0 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5" />
            {dateStr}
          </span>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-2xl font-black">Today&apos;s Workout</h3>
            <span className="text-sm font-bold text-blue-200">
              {totalSetsCompleted} / {totalSetsTarget} Sets Done
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>

        {log.completed && (
          <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-2xl text-xs font-bold backdrop-blur-sm">
            <Trophy className="w-4 h-4 text-amber-300" />
            Workout Finished & Completed! 🎉
          </div>
        )}
      </div>

      {/* Exercises Checklist */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
          Exercises Checklist ({log.exercises.filter((e) => e.completed).length}/{log.exercises.length})
        </h4>

        <div className="space-y-3">
          {log.exercises.map((ex) => (
            <div
              key={ex.id}
              className={cn(
                'p-4 rounded-2xl border transition-all space-y-3',
                ex.completed
                  ? 'bg-green-50/60 dark:bg-green-950/20 border-green-200 dark:border-green-900/40'
                  : 'bg-gray-50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-800'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleExerciseDone(dateStr, ex.id)}
                    className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center transition-all border-2',
                      ex.completed
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </button>

                  <div>
                    <h5
                      className={cn(
                        'font-bold text-sm text-gray-900 dark:text-white',
                        ex.completed && 'line-through text-gray-400 dark:text-gray-500'
                      )}
                    >
                      {ex.name}
                    </h5>
                    <span className="text-xs text-gray-500">
                      Target: {ex.targetSets} sets × {ex.targetReps} reps
                      {ex.weight ? ` • ${ex.weight}` : ''}
                    </span>
                  </div>
                </div>

                {/* Set counter buttons */}
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                  <button
                    onClick={() => updateCompletedSet(dateStr, ex.id, -1)}
                    disabled={ex.completedSets <= 0}
                    className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-700 flex items-center justify-center disabled:opacity-30 text-gray-700 dark:text-gray-200 font-bold text-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black px-1 min-w-[24px] text-center">
                    {ex.completedSets}/{ex.targetSets}
                  </span>
                  <button
                    onClick={() => updateCompletedSet(dateStr, ex.id, 1)}
                    className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workout Notes */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-gray-400 mb-1 px-1">
            Workout Notes / Feelings (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Felt great on bench press, increased weight by 5kg!"
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleFinish}
          className={cn(
            'w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 mt-2',
            log.completed
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
          )}
        >
          <Sparkles className="w-4 h-4" />
          {log.completed ? 'Update Finished Workout 🎉' : 'Finish Today Workout 🎉'}
        </button>
      </div>

      {/* Celebration Modal / Popup */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl space-y-4 border border-gray-100 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-3xl shadow-inner">
              🏆
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                Workout Complete!
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Awesome work completing your <b>{log.dayTitle}</b> workout for today!
              </p>
            </div>
            <button
              onClick={() => setShowCelebration(false)}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-500/20"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
