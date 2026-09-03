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

export const workoutExercisesService = {
  async fetchExercises(): Promise<WorkoutExerciseRow[]> {
    const { data, error } = await supabase
      .from('workout_exercises')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Error fetching workout exercises from Supabase:', error.message);
      return [];
    }
    const result = workoutExerciseRowSchema.array().safeParse(data || []);
    if (!result.success) {
      console.warn('Invalid workout exercise data:', result.error.message);
      return [];
    }
    return result.data;
  },

  async upsertExercise(exercise: Partial<WorkoutExerciseRow>): Promise<WorkoutExerciseRow | null> {
    const payload = workoutExerciseRowSchema.partial().parse(exercise);
    const { data, error } = await supabase
      .from('workout_exercises')
      .upsert(payload, { onConflict: 'name' })
      .select()
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
    const { error } = await supabase.from('workout_exercises').delete().eq('id', id);
    if (error) {
      console.warn('Error deleting exercise from Supabase:', error.message);
      return false;
    }
    return true;
  },
};
