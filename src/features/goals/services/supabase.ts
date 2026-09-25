import { z } from 'zod';
import { accountService } from '@/lib/supabase/account-client';
import { DataRequestError, readCompleteList, requireResult } from '@/lib/supabase/request';
import {
  goalCurrencySchema,
  goalSettingsSchema,
  goalStatusSchema,
  type Goal,
  type GoalSettings,
} from '../types';

const uuid = z.string().uuid();
const subIdeaSchema = z.object({
  id: uuid,
  text: z.string().min(1).max(160),
  isDone: z.boolean(),
  createdAt: z.string(),
});
const savingSchema = z.object({
  id: uuid,
  amount: z.number().positive().finite(),
  note: z.string().max(160),
  savedAt: z.string(),
  createdAt: z.string(),
});
const goalSchema = z.object({
  id: uuid,
  title: z.string().trim().min(1).max(120),
  why: z.string().max(500),
  targetDate: z.string(),
  targetAmount: z.number().positive().finite().nullable(),
  currency: goalCurrencySchema,
  places: z.array(z.string()),
  subIdeas: z.array(subIdeaSchema),
  savings: z.array(savingSchema),
  status: goalStatusSchema,
  completionNote: z.string().max(800),
  energyScore: z.number().int().min(1).max(5).nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const rowSchema = z.object({
  id: uuid,
  title: z.string(),
  why: z.string(),
  target_date: z.string().nullable(),
  target_amount: z.number().nullable(),
  currency: goalCurrencySchema,
  places: z.array(z.string()),
  sub_ideas: z.array(subIdeaSchema),
  savings: z.array(savingSchema),
  status: goalStatusSchema,
  completion_note: z.string(),
  energy_score: z.number().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
const columns =
  'id, title, why, target_date, target_amount, currency, places, sub_ideas, savings, status, completion_note, energy_score, completed_at, created_at, updated_at';

function mapGoal(value: unknown): Goal {
  const row = rowSchema.parse(value);
  return goalSchema.parse({
    id: row.id,
    title: row.title,
    why: row.why,
    targetDate: row.target_date ?? '',
    targetAmount: row.target_amount,
    currency: row.currency,
    places: row.places,
    subIdeas: row.sub_ideas,
    savings: row.savings,
    status: row.status,
    completionNote: row.completion_note,
    energyScore: row.energy_score,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function goalPayload(value: Goal) {
  const goal = goalSchema.parse(value);
  return {
    id: goal.id,
    title: goal.title,
    why: goal.why,
    target_date: goal.targetDate || null,
    target_amount: goal.targetAmount,
    currency: goal.currency,
    places: goal.places,
    sub_ideas: goal.subIdeas,
    savings: goal.savings,
    status: goal.status,
    completion_note: goal.completionNote,
    energy_score: goal.energyScore,
    completed_at: goal.completedAt,
    created_at: goal.createdAt,
    updated_at: goal.updatedAt,
  };
}

export const goalsService = {
  async fetchSnapshot(): Promise<{ userId: string; goals: Goal[]; settings: GoalSettings }> {
    const { supabase, userId } = await accountService.getClient();
    const { data } = await readCompleteList(
      supabase
        .from('goals')
        .select(columns, { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false }),
    );
    const settingsResult = await supabase
      .from('goal_settings')
      .select('show_completed_on_home')
      .eq('user_id', userId)
      .maybeSingle();
    if (settingsResult.error) {
      throw new DataRequestError(
        'Could not load goal settings. Please try again.',
        settingsResult.error,
      );
    }
    return {
      userId,
      goals: data.map(mapGoal),
      settings: goalSettingsSchema.parse({
        showCompletedOnHome: settingsResult.data?.show_completed_on_home ?? true,
      }),
    };
  },

  async saveGoal(goal: Goal): Promise<Goal> {
    const { supabase } = await accountService.getClient();
    const result = await supabase
      .from('goals')
      .upsert(goalPayload(goal), { onConflict: 'id' })
      .select(columns)
      .single();
    return mapGoal(requireResult(result, 'Could not save this goal. Please try again.'));
  },

  async deleteGoal(id: string): Promise<void> {
    const { supabase, userId } = await accountService.getClient();
    const result = await supabase
      .from('goals')
      .delete()
      .eq('id', uuid.parse(id))
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();
    // Delta replay can repeat a committed delete after a lost response.
    if (result.error)
      throw new DataRequestError('Could not delete this goal. Please try again.', result.error);
  },

  async saveSettings(settings: GoalSettings): Promise<GoalSettings> {
    const { supabase } = await accountService.getClient();
    const values = goalSettingsSchema.parse(settings);
    const result = await supabase
      .from('goal_settings')
      .upsert({ show_completed_on_home: values.showCompletedOnHome }, { onConflict: 'user_id' })
      .select('show_completed_on_home')
      .single();
    const row = requireResult(result, 'Could not save goal settings. Please try again.');
    return goalSettingsSchema.parse({ showCompletedOnHome: row.show_completed_on_home });
  },
};
