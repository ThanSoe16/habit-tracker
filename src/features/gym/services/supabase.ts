import { z } from 'zod';
import { listPage, pageRange } from '@/lib/supabase/pagination';
import { durableMediaTree, resolveMediaTree } from '@/lib/supabase/private-media';
import { readCompleteList, DataRequestError } from '@/lib/supabase/request';
import { accountService } from '@/lib/supabase/account-client';
import type { Exercise, PlanDay, WorkoutLog } from '@/features/gym/store/model';

export const gymService = {
  async workoutPage(page: number, signal: AbortSignal) {
    const { supabase } = await accountService.getClient();
    const result = listPage(
      await supabase
        .from('workout_logs')
        .select('date_key,workout_data', { count: 'exact' })
        .order('date_key', { ascending: false })
        .range(...pageRange(page))
        .abortSignal(signal),
      page,
    );
    const rows: WorkoutLog[] = result.rows.map((row) => row.workout_data);
    return { ...result, rows: await resolveMediaTree(supabase, rows) };
  },
  async workoutSummary(signal: AbortSignal) {
    const { supabase } = await accountService.getClient();
    const { data } = await readCompleteList(
      supabase
        .from('workout_logs')
        .select('date_key,completed:workout_data->completed,exercises:workout_data->exercises', {
          count: 'exact',
        })
        .order('date_key')
        .abortSignal(signal),
    );
    const rows = z
      .array(
        z.object({
          completed: z.boolean().nullish(),
          exercises: z
            .array(z.object({ completedSets: z.number().optional().default(0) }))
            .nullish(),
        }),
      )
      .parse(data);
    return {
      workouts: rows.filter((row) => row.completed).length,
      sets: rows.reduce(
        (sum, row) =>
          sum +
          (row.exercises ?? []).reduce((total, exercise) => total + exercise.completedSets, 0),
        0,
      ),
    };
  },
  async workout(date: string, signal: AbortSignal): Promise<WorkoutLog | null> {
    z.string().date().parse(date);
    const { supabase } = await accountService.getClient();
    const result = await supabase
      .from('workout_logs')
      .select('workout_data')
      .eq('date_key', date)
      .abortSignal(signal)
      .maybeSingle();
    if (result.error) throw new DataRequestError('Could not load this workout.', result.error);
    return result.data ? resolveMediaTree(supabase, result.data.workout_data) : null;
  },

  async fetchGymPlans(): Promise<PlanDay[]> {
    const { supabase } = await accountService.getClient();
    const { data } = await readCompleteList(
      supabase
        .from('gym_plans')
        .select('day_index, day_name, title, is_rest_day, exercises', { count: 'exact' })
        .order('day_index'),
    );
    if (!data) return [];
    return resolveMediaTree(
      supabase,
      data.map((row) => ({
        dayIndex: row.day_index,
        dayName: row.day_name,
        title: row.title,
        isRestDay: row.is_rest_day,
        exercises: row.exercises || [],
      })),
    );
  },

  async upsertGymPlan(plan: PlanDay): Promise<void> {
    const { supabase } = await accountService.getClient();
    const payload = {
      day_index: plan.dayIndex,
      day_name: plan.dayName,
      title: plan.title,
      is_rest_day: plan.isRestDay,
      exercises: plan.exercises,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('gym_plans')
      .upsert(durableMediaTree(supabase, payload), { onConflict: 'user_id,day_index' });
    if (error) console.warn('Error upserting gym plan to Supabase:', error.message);
  },

  async fetchCustomExercises(): Promise<Exercise[]> {
    const { supabase } = await accountService.getClient();
    const { data } = await readCompleteList(
      supabase
        .from('gym_custom_exercises')
        .select('id, name, category, default_sets, default_reps, is_custom, image_url', {
          count: 'exact',
        })
        .order('id'),
    );
    if (!data) return [];
    return resolveMediaTree(
      supabase,
      data.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        defaultSets: row.default_sets,
        defaultReps: row.default_reps,
        isCustom: row.is_custom,
        imageUrl: row.image_url || undefined,
      })),
    );
  },

  async upsertCustomExercise(exercise: Exercise): Promise<void> {
    const { supabase } = await accountService.getClient();
    const payload = {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      default_sets: exercise.defaultSets || 3,
      default_reps: exercise.defaultReps || '10',
      is_custom: exercise.isCustom ?? true,
      image_url: exercise.imageUrl || null,
    };
    const { error } = await supabase
      .from('gym_custom_exercises')
      .upsert(durableMediaTree(supabase, payload), { onConflict: 'id' });
    if (error) console.warn('Error upserting custom exercise:', error.message);
  },

  async deleteCustomExercise(id: string): Promise<void> {
    const { supabase } = await accountService.getClient();
    const { error } = await supabase.from('gym_custom_exercises').delete().eq('id', id);
    if (error) console.warn('Error deleting custom exercise:', error.message);
  },

  async fetchWorkoutLogs(): Promise<Record<string, WorkoutLog>> {
    const { supabase } = await accountService.getClient();
    const { data } = await readCompleteList(
      supabase
        .from('workout_logs')
        .select('date_key, workout_data', { count: 'exact' })
        .order('date_key'),
    );
    const result: Record<string, WorkoutLog> = {};
    if (data) {
      for (const row of data) {
        result[row.date_key] = row.workout_data;
      }
    }
    return resolveMediaTree(supabase, result);
  },

  async upsertWorkoutLog(dateKey: string, log: WorkoutLog): Promise<WorkoutLog> {
    const { supabase } = await accountService.getClient();
    const payload = {
      date_key: dateKey,
      workout_data: log,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('workout_logs')
      .upsert(durableMediaTree(supabase, payload), { onConflict: 'user_id,date_key' })
      .select('workout_data')
      .single();
    if (error || !data)
      throw new DataRequestError('Could not save workout. Please try again.', error);
    return resolveMediaTree(supabase, data.workout_data);
  },

  async deleteWorkoutLog(dateKey: string): Promise<void> {
    const { supabase } = await accountService.getClient();
    const { error } = await supabase.from('workout_logs').delete().eq('date_key', dateKey);
    if (error) throw new DataRequestError('Could not delete the workout.', error);
  },

  async fetchGymSettings(): Promise<Record<string, any> | null> {
    const { supabase } = await accountService.getClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('gym_settings')
      .eq('id', 'default_user')
      .maybeSingle();

    if (error)
      throw new DataRequestError('Could not sync workout settings. Please try again.', error);
    return resolveMediaTree(supabase, data?.gym_settings || null);
  },

  async saveGymSettings(settings: Record<string, any>): Promise<void> {
    const { supabase } = await accountService.getClient();
    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        { id: 'default_user', gym_settings: durableMediaTree(supabase, settings) },
        { onConflict: 'user_id,id' },
      );

    if (error)
      throw new DataRequestError('Could not sync workout settings. Please try again.', error);
  },
};
