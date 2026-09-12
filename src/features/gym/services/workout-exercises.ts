import { readCompleteList, DataRequestError, textIdSchema } from '@/lib/supabase/request';
import { accountService } from '@/lib/supabase/account-client';
import { durableMediaTree, resolveMediaTree } from '@/lib/supabase/private-media';
import { uploadMediaToStorage } from '@/features/media/services/supabase';
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
    const { supabase } = await accountService.getClient();
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
    return resolveMediaTree(supabase, result.data);
  },

  async upsertExercise(exercise: Partial<WorkoutExerciseRow>): Promise<WorkoutExerciseRow | null> {
    const payload = workoutExerciseRowSchema.partial().parse(exercise);
    const { supabase } = await accountService.getClient();
    const { data, error } = await supabase
      .from('workout_exercises')
      .upsert(durableMediaTree(supabase, payload), { onConflict: 'user_id,name' })
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
    return resolveMediaTree(supabase, result.data);
  },

  async uploadExerciseImage(file: File, fileName: string): Promise<string | null> {
    try {
      return await uploadMediaToStorage(file, fileName);
    } catch (err) {
      console.warn('Error in uploadExerciseImage:', err);
      return null;
    }
  },

  async deleteExercise(id: string): Promise<boolean> {
    const { supabase } = await accountService.getClient();
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
