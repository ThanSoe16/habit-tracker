'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dumbbell, Upload, Loader2, X } from 'lucide-react';
import { Exercise, ExerciseCategory, useGymStore } from '@/store/use-gym-store';
import { getExerciseImage } from '@/utils/workout-images';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ExerciseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Exercise | null;
  onSaved?: (exercise: Exercise) => void;
}

const CATEGORIES: ExerciseCategory[] = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Other',
];

export function ExerciseFormModal({
  isOpen,
  onClose,
  initialData,
  onSaved,
}: ExerciseFormModalProps) {
  const { addCustomExercise, updateCustomExercise } = useGymStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('Chest');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState('8-12');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setSets(initialData.defaultSets || 4);
      setReps(initialData.defaultReps || '8-12');
      setImageUrl(initialData.imageUrl || null);
    } else {
      setName('');
      setCategory('Chest');
      setSets(4);
      setReps('8-12');
      setImageUrl(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const cleanCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = `${cleanCategory}/${cleanFileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('workout-images')
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage
        .from('workout-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrlData.publicUrl);
      toast.success('Exercise image uploaded!');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Exercise name is required');
      return;
    }

    if (initialData) {
      updateCustomExercise(initialData.id, {
        name: trimmedName,
        category,
        defaultSets: sets,
        defaultReps: reps,
        imageUrl,
      });
      toast.success('Exercise updated successfully!');
      if (onSaved) {
        onSaved({
          ...initialData,
          name: trimmedName,
          category,
          defaultSets: sets,
          defaultReps: reps,
          imageUrl,
        });
      }
    } else {
      const created = addCustomExercise(trimmedName, category, sets, reps, imageUrl);
      toast.success('Exercise created successfully!');
      if (onSaved) {
        onSaved(created);
      }
    }

    onClose();
  };

  const previewImage = imageUrl || (name ? getExerciseImage(name) : null);

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {initialData ? 'Edit Exercise' : 'Create New Exercise'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Exercise Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Incline Dumbbell Flyes"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category & Sets/Reps */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Default Sets
              </label>
              <input
                type="number"
                min={1}
                value={sets}
                onChange={(e) => setSets(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Default Reps
              </label>
              <input
                type="text"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="8-12"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Exercise Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Exercise Image
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 relative overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-xs">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Exercise preview"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                ) : (
                  <Dumbbell className="w-6 h-6 text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-900/40 transition-colors shadow-xs">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">
                  PNG, JPG, or WebP
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              {initialData ? 'Save Changes' : 'Create Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
