import {
  readCompleteList,
  requireResult,
  DataRequestError,
  textIdSchema,
} from '@/lib/supabase/request';
import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

export const bodyMetricRowSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  logged_at: z.string(),
  height_cm: z.number().optional(),
  weight_kg: z.number().finite().positive(),
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

const columns =
  'id, user_id, logged_at, height_cm, weight_kg, target_weight_kg, dob, gender, body_fat_pct, muscle_mass_kg, fitness_goal, activity_level, notes';

function parseMetric(row: unknown): BodyMetricRow {
  if (!row || typeof row !== 'object')
    throw new DataRequestError('Body metric data was incomplete.');
  const result = bodyMetricRowSchema.safeParse(
    Object.fromEntries(Object.entries(row).filter(([, value]) => value !== null)),
  );
  if (!result.success) throw new DataRequestError('Body metric data was incomplete.');
  return result.data;
}

export const gymBodyMetricsService = {
  async fetchLogs(): Promise<BodyMetricRow[]> {
    const { data } = await readCompleteList(
      supabase
        .from('gym_body_metrics')
        .select(columns, { count: 'exact' })
        .eq('user_id', 'default_user')
        .order('logged_at')
        .order('id'),
    );
    return data.map(parseMetric);
  },

  async insertLog(row: BodyMetricRow): Promise<BodyMetricRow> {
    row = bodyMetricRowSchema.parse(row);
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
      .select(columns)
      .single();

    return parseMetric(
      requireResult({ data, error }, 'Could not save body metrics. Please try again.'),
    );
  },

  async deleteLog(id: string): Promise<void> {
    requireResult(
      await supabase
        .from('gym_body_metrics')
        .delete()
        .eq('id', textIdSchema.parse(id))
        .eq('user_id', 'default_user')
        .select('id')
        .single(),
      'Could not delete body metrics. Please try again.',
    );
  },
};
