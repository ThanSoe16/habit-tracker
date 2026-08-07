'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Timer, Dumbbell } from 'lucide-react';
import { ExerciseSetDetail, PlanExercise } from '@/store/use-gym-store';
import { getExerciseImage } from '@/utils/workout-images';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface AddSetsModalProps {
  isOpen: boolean;
  exercise: PlanExercise | null;
  onClose: () => void;
  onSave: (setsDetails: ExerciseSetDetail[], targetSets: number, targetReps: string, weight: string) => void;
}

export function AddSetsModal({ isOpen, exercise, onClose, onSave }: AddSetsModalProps) {
  const [sets, setSets] = useState<ExerciseSetDetail[]>([]);
  const [enableRestTimer, setEnableRestTimer] = useState(true);

  useEffect(() => {
    if (exercise) {
      if (exercise.setsDetails && exercise.setsDetails.length > 0) {
        setSets(exercise.setsDetails);
      } else {
        // Initialize default sets based on targetSets, targetReps & weight
        const initialCount = exercise.targetSets || 3;
        const parsedWeight = parseFloat(exercise.weight || '20') || 20;
        const parsedReps = parseInt(exercise.targetReps || '10', 10) || 10;

        const defaultSets: ExerciseSetDetail[] = Array.from({ length: initialCount }, (_, i) => ({
          setNumber: i + 1,
          reps: parsedReps,
          weightKg: parsedWeight,
        }));
        setSets(defaultSets);
      }
    }
  }, [exercise]);

  if (!isOpen || !exercise) return null;

  const handleUpdateSet = (index: number, field: 'reps' | 'weightKg', value: number) => {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: Math.max(0, value) } : s)),
    );
  };

  const handleAddSet = () => {
    setSets((prev) => {
      const lastSet = prev[prev.length - 1];
      const newSetNumber = prev.length + 1;
      return [
        ...prev,
        {
          setNumber: newSetNumber,
          reps: lastSet ? lastSet.reps : 10,
          weightKg: lastSet ? lastSet.weightKg : 20,
        },
      ];
    });
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) {
      toast.error('Must have at least 1 set');
      return;
    }
    setSets((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, setNumber: i + 1 })),
    );
  };

  const handleSave = () => {
    const totalSets = sets.length;
    const firstSet = sets[0];
    const repsSummary = firstSet ? `${firstSet.reps}` : '10';
    const weightSummary = firstSet ? `${firstSet.weightKg}kg` : '20kg';

    onSave(sets, totalSets, repsSummary, weightSummary);
    toast.success(`Updated ${exercise.name} sets & weight config`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 dark:border-zinc-800">
        {/* Header Hero Section */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-6 text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight leading-tight">Add Sets & KG</h2>
                <p className="text-[11px] font-medium text-blue-200">Workout Creation</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Rest Timer Switch Bar */}
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl">
            <span className="text-xs font-semibold flex items-center gap-1.5 text-blue-100">
              <Timer className="w-3.5 h-3.5 text-blue-300" /> Enable Rest Timer
            </span>
            <Switch checked={enableRestTimer} onCheckedChange={setEnableRestTimer} />
          </div>
        </div>

        {/* Body Section */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Exercise Title Card */}
          <div className="bg-gray-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-700 relative flex items-center justify-center shadow-xs p-0.5">
                {getExerciseImage(exercise.name) ? (
                  <Image
                    src={getExerciseImage(exercise.name)!}
                    alt={exercise.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <Dumbbell className="w-6 h-6 text-blue-500" />
                )}
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  {exercise.category}
                </span>
                <h3 className="text-base font-black text-gray-900 dark:text-white mt-1 truncate">
                  {exercise.name}
                </h3>
              </div>
            </div>

            <span className="text-xs font-bold text-gray-400 shrink-0">
              {sets.length} {sets.length === 1 ? 'Set' : 'Sets'} Total
            </span>
          </div>

          {/* Sets List (Matching Screenshot Design) */}
          <div className="space-y-3">
            {sets.map((setDetail, idx) => (
              <div
                key={setDetail.setNumber}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-700/60 pb-2">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    SET {setDetail.setNumber}
                  </span>
                  {sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSet(idx)}
                      className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                {/* Reps & KG Row */}
                <div className="grid grid-cols-2 gap-3 items-center">
                  {/* Reps Selector */}
                  <div className="flex flex-col items-center justify-center p-2.5 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-100 dark:border-zinc-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">Reps</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, 'reps', setDetail.reps - 1)}
                        className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-zinc-700 font-black text-xs text-gray-700 dark:text-gray-200"
                      >
                        -
                      </button>
                      <span className="text-base font-black text-gray-900 dark:text-white min-w-[28px] text-center tabular-nums">
                        {setDetail.reps}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, 'reps', setDetail.reps + 1)}
                        className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* KG Selector */}
                  <div className="flex flex-col items-center justify-center p-2.5 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-100 dark:border-zinc-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">Weight (KG)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, 'weightKg', setDetail.weightKg - 2.5)}
                        className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-zinc-700 font-black text-xs text-gray-700 dark:text-gray-200"
                      >
                        -
                      </button>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400 min-w-[36px] text-center tabular-nums">
                        {setDetail.weightKg}
                        <span className="text-[10px] text-gray-400 ml-0.5">kg</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, 'weightKg', setDetail.weightKg + 2.5)}
                        className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Set Button */}
          <button
            type="button"
            onClick={handleAddSet}
            className="w-full py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 font-bold text-xs hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> ADD SET
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Save Sets & KG
          </button>
        </div>
      </div>
    </div>
  );
}
