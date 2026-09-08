import { readCompleteList, DataRequestError, textIdSchema } from '@/lib/supabase/request';
import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

export const workoutExerciseRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  image_url: z.string().nullish(),
  default_sets: z.number().nullish(),
  default_reps: z.string().nullish(),
  is_custom: z.boolean().nullish(),
  created_at: z.string().nullish(),
});

export type WorkoutExerciseRow = z.infer<typeof workoutExerciseRowSchema>;

const columns = 'id, name, category, image_url, default_sets, default_reps, is_custom, created_at';

export const workoutExercisesService = {
  async fetchExercises(): Promise<WorkoutExerciseRow[]> {
    const { data } = await readCompleteList(
      supabase
        .from('workout_exercises')
        .select(columns, { count: 'exact' })
        .order('name')
        .order('id'),
    );

    const result = workoutExerciseRowSchema.array().safeParse(data || []);
    if (!result.success) {
      throw new DataRequestError('Workout exercise data was incomplete.');
    }
    return result.data;
  },

  async upsertExercise(exercise: Partial<WorkoutExerciseRow>): Promise<WorkoutExerciseRow | null> {
    const payload = workoutExerciseRowSchema.partial().parse(exercise);
    const { data, error } = await supabase
      .from('workout_exercises')
      .upsert(payload, { onConflict: 'name' })
      .select(columns)
      .single();

    if (error) {
      console.warn('Error upserting exercise in Supabase:', error.message);
      return null;
    }
    const result = workoutExerciseRowSchema.safeParse(data);
    if (!result.success) {
      console.warn('Invalid upserted workout exercise data:', result.error.message);
      return null;
    }
    return result.data;
  },

  async uploadExerciseImage(file: File, fileName: string): Promise<string | null> {
    try {
      const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('workout-images')
        .upload(cleanFileName, file, { upsert: true });

      if (error) {
        console.warn('Error uploading image to Supabase storage:', error.message);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('workout-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Error in uploadExerciseImage:', err);
      return null;
    }
  },

  async deleteExercise(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('id', textIdSchema.parse(id))
      .select('id')
      .single();
    if (error) {
      console.warn('Error deleting exercise from Supabase:', error.message);
      return false;
    }
    return Boolean(data);
  },
};
