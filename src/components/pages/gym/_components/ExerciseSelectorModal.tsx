'use client';

import { useState } from 'react';
import { Search, Plus, Check, Dumbbell, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  useGymStore,
  PRESET_EXERCISES,
  ExerciseCategory,
  Exercise,
} from '@/store/useGymStore';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise, sets: number, reps: string, weight?: string) => void;
}

const CATEGORIES: Array<ExerciseCategory | 'All'> = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
];

export function ExerciseSelectorModal({
  isOpen,
  onClose,
  onSelectExercise,
}: ExerciseSelectorModalProps) {
  const { customExercises, addCustomExercise } = useGymStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'All'>('All');
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  
  // Quick set/rep configuration before adding
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState('10-12');
  const [weight, setWeight] = useState('');

  // Custom Exercise Form state
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCat, setCustomCat] = useState<ExerciseCategory>('Chest');

  if (!isOpen) return null;

  const allExercises = [...PRESET_EXERCISES, ...customExercises];

  const filteredExercises = allExercises.filter((ex) => {
    const matchesCat = selectedCategory === 'All' || ex.category === selectedCategory;
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleChoose = (ex: Exercise) => {
    setSelectedEx(ex);
    setSets(ex.defaultSets || 3);
    setReps(ex.defaultReps || '10');
    setWeight('');
  };

  const handleConfirmAdd = () => {
    if (!selectedEx) return;
    onSelectExercise(selectedEx, sets, reps, weight);
    setSelectedEx(null);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const created = addCustomExercise(customName.trim(), customCat, 3, '10');
    setCustomName('');
    setShowAddCustom(false);
    handleChoose(created);
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
            <h3 className="font-bold text-lg">
              {selectedEx ? `Configure: ${selectedEx.name}` : 'Select Exercise'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
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
            {/* Search & Custom exercise prompt */}
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
                        ? 'bg-blue-600 text-white'
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
              {showAddCustom ? (
                <form onSubmit={handleCreateCustom} className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl space-y-3">
                  <h4 className="font-bold text-sm">Add New Custom Exercise</h4>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Exercise name (e.g. Cable Kickbacks)"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <select
                      value={customCat}
                      onChange={(e) => setCustomCat(e.target.value as ExerciseCategory)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCustom(false)}
                      className="px-3 py-2 bg-gray-200 dark:bg-zinc-700 text-xs font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddCustom(true)}
                  className="w-full py-2.5 px-4 border border-dashed border-blue-400 dark:border-blue-600 rounded-2xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Custom Exercise
                </button>
              )}

              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleChoose(ex)}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 hover:bg-blue-50/70 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {ex.name}
                      </span>
                      {ex.isCustom && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {ex.category} • Default {ex.defaultSets || 3} sets × {ex.defaultReps || '10'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 text-gray-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
