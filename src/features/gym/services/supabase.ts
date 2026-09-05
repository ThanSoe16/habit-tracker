import { supabase } from '@/lib/supabase/client';
import type { Exercise, PlanDay, WorkoutLog } from '@/features/gym/store/model';

export const gymService = {
  async fetchGymPlans(): Promise<PlanDay[]> {
    const { data, error } = await supabase
      .from('gym_plans')
      .select('*')
      .order('day_index', { ascending: true });
    if (error) {
      console.warn('Error fetching gym plans from Supabase:', error.message);
      return [];
    }
    if (!data) return [];
    return data.map((row) => ({
      dayIndex: row.day_index,
      dayName: row.day_name,
      title: row.title,
      isRestDay: row.is_rest_day,
      exercises: row.exercises || [],
    }));
  },

  async upsertGymPlan(plan: PlanDay): Promise<void> {
    const payload = {
      day_index: plan.dayIndex,
      day_name: plan.dayName,
      title: plan.title,
      is_rest_day: plan.isRestDay,
      exercises: plan.exercises,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('gym_plans').upsert(payload, { onConflict: 'day_index' });
    if (error) console.warn('Error upserting gym plan to Supabase:', error.message);
  },

  async fetchCustomExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase.from('gym_custom_exercises').select('*');
    if (error) {
      console.warn('Error fetching custom exercises:', error.message);
      return [];
    }
    if (!data) return [];
    return data.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      defaultSets: row.default_sets,
      defaultReps: row.default_reps,
      isCustom: row.is_custom,
      imageUrl: row.image_url || undefined,
    }));
  },

  async upsertCustomExercise(exercise: Exercise): Promise<void> {
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
      .upsert(payload, { onConflict: 'id' });
    if (error) console.warn('Error upserting custom exercise:', error.message);
  },

  async deleteCustomExercise(id: string): Promise<void> {
    const { error } = await supabase.from('gym_custom_exercises').delete().eq('id', id);
    if (error) console.warn('Error deleting custom exercise:', error.message);
  },

  async fetchWorkoutLogs(): Promise<Record<string, WorkoutLog>> {
    const { data, error } = await supabase.from('workout_logs').select('*');
    if (error) {
      console.warn('Error fetching workout logs from Supabase:', error.message);
      return {};
    }
    const result: Record<string, WorkoutLog> = {};
    if (data) {
      for (const row of data) {
        result[row.date_key] = row.workout_data;
      }
    }
    return result;
  },

  async upsertWorkoutLog(dateKey: string, log: WorkoutLog): Promise<void> {
    const payload = {
      date_key: dateKey,
      workout_data: log,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('workout_logs')
      .upsert(payload, { onConflict: 'date_key' });
    if (error) console.warn('Error upserting workout log to Supabase:', error.message);
  },

  async deleteWorkoutLog(dateKey: string): Promise<void> {
    const { error } = await supabase.from('workout_logs').delete().eq('date_key', dateKey);
    if (error) console.warn('Error deleting workout log from Supabase:', error.message);
  },

  async fetchGymSettings(): Promise<Record<string, any> | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('gym_settings')
      .eq('id', 'default_user')
      .single();

    if (error) return null;
    return data?.gym_settings || null;
  },

  async saveGymSettings(settings: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: 'default_user', gym_settings: settings }, { onConflict: 'id' });

    if (error) console.warn('Error saving gym settings to Supabase:', error.message);
  },
};
