'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Plus, Trash2, Moon, Dumbbell, Edit2, Check, RotateCcw, HelpCircle, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useGymStore, Exercise, PlanExercise, ExerciseSetDetail } from '@/store/use-gym-store';
import { getExerciseImage } from '@/utils/workout-images';
import { ExerciseSelectorModal } from '../../workouts/_components/exercise-selector-modal';
import { ExerciseGuideModal } from '../../workouts/_components/exercise-guide-modal';
import { AddSetsModal } from './_components/add-sets-modal';

export function PlanEditor() {
  const {
    weeklyPlan,
    activeDayIndex,
    setActiveDayIndex,
    updateDayTitle,
    toggleRestDay,
    addExerciseToDay,
    removeExerciseFromDay,
    updatePlanExercise,
    applyDefaultDay1Routine,
    applyDefaultDay2Routine,
    applyDefaultDay3Routine,
    applyDefaultDay5Routine,
    applyDefaultDay6Routine,
    resetWeeklyPlanToDefault,
  } = useGymStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [selectedGuideName, setSelectedGuideName] = useState<string | null>(null);

  // Set Details Configuration Modal State
  const [selectedSetsExercise, setSelectedSetsExercise] = useState<PlanExercise | null>(null);

  const sortedWeeklyPlan = [...weeklyPlan].sort((a, b) => a.dayIndex - b.dayIndex);
  const currentDay =
    weeklyPlan.find((day) => day.dayIndex === activeDayIndex) || sortedWeeklyPlan[0];

  const handleStartEditTitle = () => {
    setTitleInput(currentDay.title);
    setEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      updateDayTitle(currentDay.dayIndex, titleInput.trim());
    }
    setEditingTitle(false);
  };

  const handleSelectExercise = (
    exercise: Exercise,
    sets: number,
    reps: string,
    weight?: string,
  ) => {
    addExerciseToDay(currentDay.dayIndex, exercise, sets, reps, weight);
  };

  return (
    <div className="space-y-4">
      {/* 7-Day Day Selector Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3 border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
          7-Day Weekly Split
        </div>
        <div className="grid grid-cols-7 gap-1">
          {sortedWeeklyPlan.map((day) => {
            const isActive = day.dayIndex === activeDayIndex;
            return (
              <button
                key={day.dayIndex}
                onClick={() => {
                  setActiveDayIndex(day.dayIndex);
                  setEditingTitle(false);
                }}
                className={cn(
                  'flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.03]'
                    : day.isRestDay
                      ? 'bg-gray-50 dark:bg-zinc-800/40 text-gray-400 hover:bg-gray-100'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200',
                )}
              >
                <span className="text-[10px] font-bold opacity-80">{day.dayName}</span>
                <span className="text-xs font-black mt-0.5">
                  {day.isRestDay ? '💤' : day.exercises.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
        {/* Day Header Info */}
        <div className="space-y-2 border-b border-gray-100 dark:border-zinc-800 pb-4">
          {/* Subtitle & Buttons */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {currentDay.dayName} Plan
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              {[0, 1, 2, 4, 5].includes(currentDay.dayIndex) && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentDay.dayIndex === 0) applyDefaultDay1Routine();
                    if (currentDay.dayIndex === 1) applyDefaultDay2Routine();
                    if (currentDay.dayIndex === 2) applyDefaultDay3Routine();
                    if (currentDay.dayIndex === 4) applyDefaultDay5Routine();
                    if (currentDay.dayIndex === 5) applyDefaultDay6Routine();
                  }}
                  title={`Load Preset Day ${currentDay.dayIndex + 1}`}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 hover:bg-blue-100 flex items-center gap-1 transition-all whitespace-nowrap"
                >
                  <RotateCcw className="w-3 h-3 shrink-0" />
                  Load Preset
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleRestDay(currentDay.dayIndex)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 border whitespace-nowrap',
                  currentDay.isRestDay
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-200',
                )}
              >
                <Moon className="w-3 h-3 shrink-0" />
                {currentDay.isRestDay ? 'Rest Day' : 'Rest'}
              </button>
            </div>
          </div>

          {/* Title Row */}
          <div>
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-base font-bold rounded-xl bg-gray-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                  {currentDay.title}
                </h3>
                <button
                  type="button"
                  onClick={handleStartEditTitle}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1 shrink-0"
                  title="Edit day title"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Exercises List */}
        {currentDay.isRestDay ? (
          <div className="text-center py-10 px-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl border border-dashed border-amber-200/50">
            <span className="text-3xl mb-2 block">😴</span>
            <h4 className="font-bold text-gray-800 dark:text-gray-200">Rest & Recovery Day</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Give your muscles time to rebuild and recover today!
            </p>
            <button
              onClick={() => toggleRestDay(currentDay.dayIndex)}
              className="mt-4 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50"
            >
              Add Workout Instead
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Planned Exercises ({currentDay.exercises.length})
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Exercise
              </button>
            </div>

            {currentDay.exercises.length === 0 ? (
              <div className="text-center py-8 px-4 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                <Dumbbell className="w-8 h-8 mx-auto text-gray-300 dark:text-zinc-600 mb-2" />
                <p className="text-xs text-muted-foreground font-medium">
                  No exercises planned for {currentDay.dayName} yet.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  + Add First Exercise
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentDay.exercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 space-y-3 group"
                  >
                    {/* Top Row: Number, Image & Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>

                      {/* Exercise Image Thumbnail */}
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-700 relative flex items-center justify-center shadow-xs p-0.5">
                        {getExerciseImage(ex.name) ? (
                          <Image
                            src={getExerciseImage(ex.name)!}
                            alt={ex.name}
                            fill
                            unoptimized
                            className="object-contain"
                          />
                        ) : (
                          <Dumbbell className="w-5 h-5 text-blue-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelectedGuideName(ex.name)}
                          className="text-left group/title inline-flex items-center gap-1.5 flex-wrap"
                        >
                          <span className="font-bold text-sm text-gray-900 dark:text-white group-hover/title:text-blue-600 transition-colors leading-tight">
                            {ex.name}
                          </span>
                          <HelpCircle className="w-3.5 h-3.5 text-blue-500/80 group-hover/title:text-blue-600 shrink-0 transition-colors inline-block" />
                        </button>
                        <div className="mt-0.5">
                          <span className="font-semibold px-2 py-0.5 rounded-md bg-gray-200/60 dark:bg-zinc-700/60 text-[10px] text-gray-600 dark:text-gray-300">
                            {ex.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Next Line: Sets/Reps Summary & Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60 dark:border-zinc-700/40">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                        <span>{ex.targetSets} sets × {ex.targetReps} reps</span>
                        {ex.weight && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            • {ex.weight}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedSetsExercise(ex)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                          title="Set Reps & KG per set"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Sets & KG</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeExerciseFromDay(currentDay.dayIndex, ex.id)}
                          className="px-2.5 py-1.5 rounded-xl text-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center gap-1 text-xs font-semibold transition-colors"
                          title="Delete Exercise"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Reset Option */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={resetWeeklyPlanToDefault}
          className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5 mx-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Entire 7-Day Split to Default
        </button>
      </div>

      {/* Exercise Selector Modal */}
      <ExerciseSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectExercise={handleSelectExercise}
      />

      {/* Exercise How-To Guide Modal */}
      <ExerciseGuideModal
        exerciseName={selectedGuideName}
        isOpen={!!selectedGuideName}
        onClose={() => setSelectedGuideName(null)}
      />

      {/* Per-Set Reps & KG Modal */}
      <AddSetsModal
        isOpen={!!selectedSetsExercise}
        exercise={selectedSetsExercise}
        onClose={() => setSelectedSetsExercise(null)}
        onSave={(setsDetails, targetSets, targetReps, weight) => {
          if (selectedSetsExercise) {
            updatePlanExercise(currentDay.dayIndex, selectedSetsExercise.id, {
              setsDetails,
              targetSets,
              targetReps,
              weight,
            });
          }
        }}
      />
    </div>
  );
}
