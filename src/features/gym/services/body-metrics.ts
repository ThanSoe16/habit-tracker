import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

export const bodyMetricRowSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  logged_at: z.string(),
  height_cm: z.number().optional(),
  weight_kg: z.number(),
  target_weight_kg: z.number().optional(),
  dob: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  body_fat_pct: z.number().optional(),
  muscle_mass_kg: z.number().optional(),
  fitness_goal: z.string().optional(),
  activity_level: z.string().optional(),
  notes: z.string().optional(),
});

export type BodyMetricRow = z.infer<typeof bodyMetricRowSchema>;

export const gymBodyMetricsService = {
  async fetchLogs(): Promise<BodyMetricRow[]> {
    const { data, error } = await supabase
      .from('gym_body_metrics')
      .select('*')
      .eq('user_id', 'default_user')
      .order('logged_at', { ascending: true });

    if (error) {
      console.warn('Error fetching gym_body_metrics from Supabase:', error.message);
      return [];
    }
    const result = bodyMetricRowSchema.array().safeParse(data || []);
    if (!result.success) {
      console.warn('Invalid gym body metric data:', result.error.message);
      return [];
    }
    return result.data;
  },

  async insertLog(row: BodyMetricRow): Promise<BodyMetricRow | null> {
    const payload = {
      user_id: 'default_user',
      logged_at: row.logged_at,
      height_cm: row.height_cm,
      weight_kg: row.weight_kg,
      target_weight_kg: row.target_weight_kg,
      dob: row.dob,
      gender: row.gender,
      body_fat_pct: row.body_fat_pct,
      muscle_mass_kg: row.muscle_mass_kg,
      fitness_goal: row.fitness_goal,
      activity_level: row.activity_level,
      notes: row.notes,
    };
    const { data, error } = await supabase
      .from('gym_body_metrics')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.warn('Error inserting body metric log:', error.message);
      return null;
    }
    const result = bodyMetricRowSchema.safeParse(data);
    if (!result.success) {
      console.warn('Invalid inserted body metric data:', result.error.message);
      return null;
    }
    return result.data;
  },

  async deleteLog(id: string): Promise<void> {
    const { error } = await supabase.from('gym_body_metrics').delete().eq('id', id);
    if (error) console.warn('Error deleting body metric log:', error.message);
  },
};
