import Image from 'next/image';
import { Check, Plus, Minus, Dumbbell, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getExerciseImage } from '@/utils/workout-images';
import type { GymSettings, WorkoutLog } from '@/features/gym/store/model';

type Exercise = WorkoutLog['exercises'][number];
interface WorkoutExercisesProps {
  exercises: Exercise[];
  gymSettings: GymSettings;
  onToggle: (id: string) => void;
  onGuide: (name: string) => void;
  onRemoveSet: (id: string) => void;
  onAddSet: (exercise: Exercise) => void;
}

export function WorkoutExercises({
  exercises,
  gymSettings,
  onToggle,
  onGuide,
  onRemoveSet,
  onAddSet,
}: WorkoutExercisesProps) {
  return (
    <div className="space-y-3">
      {exercises.map((ex) => (
        <div
          key={ex.id}
          className={cn(
            'p-4 rounded-2xl border transition-all space-y-3',
            ex.completed
              ? 'bg-green-50/60 dark:bg-green-950/20 border-green-200 dark:border-green-900/40'
              : 'bg-gray-50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-800',
          )}
        >
          {/* TOP ROW: Checkbox + Thumbnail + Title & Category Badges */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={`Mark ${ex.name} ${ex.completed ? 'incomplete' : 'complete'}`}
              aria-pressed={ex.completed}
              onClick={() => onToggle(ex.id)}
              className={cn(
                'w-6 h-6 rounded-lg flex items-center justify-center transition-all border-2 shrink-0',
                ex.completed
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-transparent',
              )}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </button>

            {/* Exercise Image Thumbnail */}
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-700 relative flex items-center justify-center shadow-xs p-0.5">
              {getExerciseImage(ex.name) ? (
                <Image
                  src={getExerciseImage(ex.name)!}
                  alt={ex.name}
                  fill
                  className="object-contain"
                />
              ) : (
                <Dumbbell className="w-5 h-5 text-blue-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => onGuide(ex.name)}
                  className="text-left group inline-flex items-center gap-1 flex-wrap"
                >
                  <span
                    className={cn(
                      'font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight',
                      ex.completed && 'line-through text-gray-400 dark:text-gray-500',
                    )}
                  >
                    {ex.name}
                  </span>
                  <HelpCircle className="w-3.5 h-3.5 text-blue-500/80 group-hover:text-blue-600 shrink-0 transition-colors inline-block" />
                </button>

                {gymSettings?.showCategoryBadges && ex.category && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 shrink-0">
                    {ex.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM ROW (NEXT LINE ACTIONS): Target Info + Set Counter Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
              Target: {ex.targetSets} sets × {ex.targetReps} reps
              {ex.weight
                ? ` • ${ex.weight}${!ex.weight.includes('kg') && !ex.weight.includes('lbs') ? gymSettings?.weightUnit || 'kg' : ''}`
                : ''}
            </span>

            {/* Set counter buttons */}
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-2 py-1 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm shrink-0">
              <button
                type="button"
                aria-label={`Remove a set from ${ex.name}`}
                onClick={() => onRemoveSet(ex.id)}
                disabled={ex.completedSets <= 0}
                className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-zinc-700 flex items-center justify-center disabled:opacity-30 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black px-1 min-w-[24px] text-center text-gray-900 dark:text-white tabular-nums">
                {ex.completedSets}/{ex.targetSets}
              </span>
              <button
                type="button"
                aria-label={`Add a set to ${ex.name}`}
                onClick={() => onAddSet(ex)}
                className="w-7 h-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
