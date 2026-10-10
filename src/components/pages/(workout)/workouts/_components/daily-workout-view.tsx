'use client';

import { useState, useRef } from 'react';
import { Play, Trophy, Calendar, Dumbbell } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/button';
import { WorkoutExercises } from './workout-exercises';
import { WorkoutSessionTimes } from './workout-session-times';
import { useGymStore } from '@/store/use-gym-store';
import { getLocalDateString } from '@/utils/date-utils';
import { ExerciseGuideModal } from './exercise-guide-modal';
import { RestTimerCountdownModal } from './rest-timer-countdown-modal';
import { toast } from 'sonner';
import { useWorkoutRestTimer } from '@/features/gym/hooks/use-workout-rest-timer';
import { RestTimerFloatingButton } from './rest-timer-floating-button';

interface DailyWorkoutViewProps {
  date?: Date;
  onGoToPlanEditor?: () => void;
}

export function DailyWorkoutView({ date = new Date(), ...props }: DailyWorkoutViewProps) {
  const dateStr = getLocalDateString(date);
  return <WorkoutSession key={dateStr} dateStr={dateStr} {...props} />;
}

function WorkoutSession({
  dateStr,
  onGoToPlanEditor,
}: {
  dateStr: string;
  onGoToPlanEditor?: () => void;
}) {
  const {
    getWorkoutLogForDate,
    startWorkout,
    updateCompletedSet,
    toggleExerciseDone,
    finishWorkout,
    gymSettings,
  } = useGymStore(
    useShallow((state) => ({
      getWorkoutLogForDate: state.getWorkoutLogForDate,
      startWorkout: state.startWorkout,
      updateCompletedSet: state.updateCompletedSet,
      toggleExerciseDone: state.toggleExerciseDone,
      finishWorkout: state.finishWorkout,
      gymSettings: state.gymSettings,
      history: state.history[dateStr],
      weeklyPlan: state.weeklyPlan,
    })),
  );
  const [notesDraft, setNotesDraft] = useState<string>();
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedGuideName, setSelectedGuideName] = useState<string | null>(null);
  const restTimer = useWorkoutRestTimer(dateStr, gymSettings.restTimerSeconds);

  // Purely fetch current log for date without setState in render
  const log = getWorkoutLogForDate(dateStr);

  const notes = notesDraft ?? log?.notes ?? '';
  const canEdit = !!log?.startedAt && !log.completed && !pending;

  const saveSession = async (action: 'start' | 'finish') => {
    if (saving.current) return;
    saving.current = true;
    setPending(true);
    setSaveError(null);
    try {
      if (action === 'start') {
        await startWorkout(dateStr);
      } else {
        await finishWorkout(dateStr, notes);
        if (!log?.completed) setShowCelebration(true);
        else toast.success('Workout notes saved.');
      }
    } catch {
      setSaveError('Could not save your workout. Please try again.');
    } finally {
      saving.current = false;
      setPending(false);
    }
  };

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
  const progressPercent =
    totalSetsTarget > 0 ? Math.round((totalSetsCompleted / totalSetsTarget) * 100) : 0;

  const handleCelebrationContinue = () => {
    setShowCelebration(false);
    toast.success('Workout saved successfully! Great job! 🎉');
  };

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/20 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] font-extrabold uppercase tracking-wider text-blue-100 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm truncate max-w-[65%]"
            title={log.dayTitle}
          >
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

      <WorkoutSessionTimes log={log} />
      {!log.startedAt && !log.completed && (
        <div className="space-y-2">
          <Button
            type="button"
            disabled={pending}
            onClick={() => void saveSession('start')}
            className="h-12 w-full rounded-2xl font-bold"
          >
            <Play className="size-4" /> {pending ? 'Starting…' : 'Start workout'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Start your workout to unlock the exercises.
          </p>
        </div>
      )}
      {saveError && (
        <p role="alert" className="text-sm text-destructive">
          {saveError}
        </p>
      )}

      {/* Exercises Checklist */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Exercises Checklist ({log.exercises.filter((e) => e.completed).length}/
            {log.exercises.length})
          </h4>
          <span className="text-[10px] font-bold text-blue-500">Tap ℹ️ for How-To Guide</span>
        </div>

        <fieldset disabled={!canEdit} className="min-w-0 disabled:opacity-50">
          <legend className="sr-only">Workout exercises</legend>
          <WorkoutExercises
            exercises={log.exercises}
            gymSettings={gymSettings}
            onToggle={(id) => toggleExerciseDone(dateStr, id)}
            onGuide={setSelectedGuideName}
            onRemoveSet={(id) => updateCompletedSet(dateStr, id, -1)}
            onAddSet={(exercise) => {
              if (gymSettings.restTimerSeconds) {
                restTimer.open({ id: exercise.id, name: exercise.name });
              } else {
                updateCompletedSet(dateStr, exercise.id, 1);
              }
            }}
          />
        </fieldset>

        {/* Workout Notes */}
        <div className="pt-2">
          <label
            htmlFor="workout-notes"
            className="block text-xs font-semibold text-gray-400 mb-1 px-1"
          >
            Workout Notes / Feelings (Optional)
          </label>
          <textarea
            id="workout-notes"
            disabled={pending || (!log.startedAt && !log.completed)}
            value={notes}
            onChange={(e) => setNotesDraft(e.target.value)}
            placeholder="e.g. Felt great on bench press, increased weight by 5kg!"
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {(log.startedAt || log.completed) && (
          <Button
            type="button"
            onClick={() => void saveSession('finish')}
            disabled={pending || !!restTimer.session?.exercise}
            className="h-12 w-full rounded-2xl font-bold"
          >
            <Trophy className="size-4" />
            {pending ? 'Saving…' : log.completed ? 'Update notes' : 'Complete workout'}
          </Button>
        )}
      </div>

      {/* Exercise Guide Modal */}
      <ExerciseGuideModal
        exerciseName={selectedGuideName}
        isOpen={!!selectedGuideName}
        onClose={() => setSelectedGuideName(null)}
      />

      {!restTimer.session && <RestTimerFloatingButton onClick={() => restTimer.open()} />}
      {restTimer.session && (
        <RestTimerCountdownModal
          isOpen={restTimer.expanded}
          onOpenChange={restTimer.setExpanded}
          onClose={restTimer.close}
          exerciseName={restTimer.session.exercise?.name}
          initialSeconds={restTimer.session.seconds}
          autoStart={!!restTimer.session.exercise}
          sound={restTimer.session.sound}
          onComplete={restTimer.complete}
        />
      )}

      {/* Celebration Modal / Popup */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95">
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
              onClick={handleCelebrationContinue}
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
