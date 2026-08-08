'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Plus, Dumbbell, X, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getExerciseImage } from '@/utils/workout-images';
import { Exercise, PRESET_EXERCISES, ExerciseCategory, useGymStore } from '@/store/use-gym-store';
import { ExerciseFormModal } from './exercise-form-modal';
import { ConfirmationDialog } from '@/components/shared/dialog/confirmation-dialog';
import { toast } from 'sonner';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise, sets: number, reps: string, weight?: string) => void;
}

const CATEGORIES: ('All' | ExerciseCategory)[] = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Other',
];

export function ExerciseSelectorModal({
  isOpen,
  onClose,
  onSelectExercise,
}: ExerciseSelectorModalProps) {
  const { customExercises, deleteCustomExercise } = useGymStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  // Quick set/rep configuration before adding
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState('8-12');
  const [weight, setWeight] = useState('');

  // CRUD modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [deletingEx, setDeletingEx] = useState<Exercise | null>(null);

  if (!isOpen) return null;

  // Combine built-in presets and user-created custom exercises
  const allExercises: Exercise[] = [...customExercises, ...PRESET_EXERCISES];

  const filteredExercises = allExercises.filter((ex) => {
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    const matchesSearch =
      !search.trim() ||
      ex.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      ex.category.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleChoose = (ex: Exercise) => {
    setSelectedEx(ex);
    setSets(ex.defaultSets || 4);
    setReps(ex.defaultReps || '8-12');
    setWeight('');
  };

  const handleConfirmAdd = () => {
    if (!selectedEx) return;
    onSelectExercise(selectedEx, sets, reps, weight);
    setSelectedEx(null);
    onClose();
  };

  const handleConfirmDelete = () => {
    if (!deletingEx) return;
    deleteCustomExercise(deletingEx.id);
    toast.success(`'${deletingEx.name}' deleted successfully`);
    setDeletingEx(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border border-gray-100 dark:border-zinc-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {selectedEx ? `Configure: ${selectedEx.name}` : 'Select Exercise'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {!selectedEx && (
              <button
                type="button"
                onClick={() => {
                  setEditingEx(null);
                  setIsFormModalOpen(true);
                }}
                className="px-2.5 py-1 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                title="Create New Exercise"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedEx ? (
          /* Configure Sets/Reps step */
          <div className="p-6 space-y-5">
            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {selectedEx.category}
              </span>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {selectedEx.name}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Target Sets
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSets(Math.max(1, sets - 1))}
                    className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 font-bold text-gray-700 dark:text-gray-200"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg w-8 text-center">{sets}</span>
                  <button
                    type="button"
                    onClick={() => setSets(sets + 1)}
                    className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 font-bold text-gray-700 dark:text-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Target Reps / Duration
                </label>
                <input
                  type="text"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="e.g. 8-12, 10, 60s"
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-gray-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Target Weight (Optional)
              </label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 20kg / Bodyweight"
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-gray-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedEx(null)}
                className="flex-1 py-3 font-semibold text-sm rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-1 py-3 font-bold text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add to Plan
              </button>
            </div>
          </div>
        ) : (
          /* Exercise Selection List */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search */}
            <div className="p-4 border-b border-gray-100 dark:border-zinc-800 space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-2xl bg-gray-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all',
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-8 px-4 text-xs text-gray-400">
                  No exercises found.
                </div>
              ) : (
                filteredExercises.map((ex) => {
                  const imageSrc = getExerciseImage(ex.name, ex.imageUrl);
                  return (
                    <div
                      key={ex.id}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 hover:bg-blue-50/70 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3 transition-all group"
                    >
                      <div
                        onClick={() => handleChoose(ex)}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-700 relative flex items-center justify-center shadow-xs p-0.5">
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={ex.name}
                              fill
                              unoptimized
                              className="object-contain"
                            />
                          ) : (
                            <Dumbbell className="w-5 h-5 text-blue-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate block">
                              {ex.name}
                            </span>
                            {ex.isCustom && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold shrink-0">
                                Custom
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                            {ex.category} • Default {ex.defaultSets || 4} sets × {ex.defaultReps || '8-12'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (Edit, Delete if custom, Add) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEx(ex);
                            setIsFormModalOpen(true);
                          }}
                          className="w-7 h-7 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center justify-center transition-colors"
                          title="Edit exercise"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {ex.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingEx(ex);
                            }}
                            className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors"
                            title="Delete exercise"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleChoose(ex)}
                          className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 text-gray-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm ml-1"
                          title="Select exercise"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Exercise Modal */}
      <ExerciseFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEx(null);
        }}
        initialData={editingEx}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deletingEx}
        onClose={() => setDeletingEx(null)}
        title="Delete Exercise"
        desc={`Are you sure you want to delete '${deletingEx?.name}'? This action cannot be undone.`}
        isDelete={true}
        enableDeleteIcon={true}
        confirmText="Delete Exercise"
        onPress={handleConfirmDelete}
      />
    </div>
  );
}
