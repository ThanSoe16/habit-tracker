import { supabase } from '@/lib/supabase/client';
import type { Habit } from '../types';
import { z } from 'zod';

export const habitRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  emoji: z.string().nullish(),
  frequency: z.string(),
  repeat_days: z.array(z.number()).nullish(),
  type: z.string().nullish(),
  start_date: z.string().nullish(),
  end_date: z.string().nullish(),
  time_of_day: z.string().nullish(),
  reminder_time: z.string().nullish(),
  end_habit_date: z.string().nullish(),
  end_habit_days: z.number().nullish(),
  specific_dates: z.array(z.string()).nullish(),
  unit_type: z.string().nullish(),
  unit: z.string().nullish(),
  goal_value: z.number().nullish(),
  timer_mode: z.string().nullish(),
  time_unit: z.string().nullish(),
  history: z
    .record(
      z.union([
        z.boolean(),
        z.object({
          completed: z.boolean(),
          timeTaken: z.string().optional(),
          count: z.string().optional(),
          notes: z.string().optional(),
        }),
      ]),
    )
    .nullish(),
  streak: z.number().nullish(),
  sort_order: z.number().nullish(),
  created_at: z.string().nullish(),
});

export type HabitRow = z.infer<typeof habitRowSchema>;

export const habitsService = {
  async fetchHabits(): Promise<Habit[] | null> {
    let { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('sort_order', { ascending: true });

    // Keep habit creation working while the sort_order migration is being deployed.
    if (error) {
      const fallback = await supabase.from('habits').select('*').order('created_at', {
        ascending: true,
      });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.warn('Error fetching habits from Supabase:', error.message);
      return null;
    }
    if (!data) return [];
    return data.map((value) => {
      const row = habitRowSchema.parse(value);
      return {
        id: row.id,
        name: row.name,
        color: row.color,
        emoji: row.emoji || undefined,
        frequency: (row.frequency || 'daily') as Habit['frequency'],
        repeatDays: row.repeat_days || [],
        type: (row.type || 'habit') as Habit['type'],
        startDate: row.start_date || undefined,
        endDate: row.end_date || undefined,
        timeOfDay: (row.time_of_day || undefined) as Habit['timeOfDay'],
        reminderTime: row.reminder_time || undefined,
        endHabitDate: row.end_habit_date || undefined,
        endHabitDays: row.end_habit_days || undefined,
        specificDates: row.specific_dates || undefined,
        unitType: (row.unit_type || 'simple') as Habit['unitType'],
        unit: row.unit || undefined,
        goalValue: row.goal_value || undefined,
        timerMode: (row.timer_mode || undefined) as Habit['timerMode'],
        timeUnit: (row.time_unit || undefined) as Habit['timeUnit'],
        history: row.history || {},
        streak: row.streak || 0,
        createdAt: row.created_at || new Date().toISOString(),
        sortOrder: row.sort_order ?? undefined,
      };
    });
  },

  async upsertHabit(habit: Habit): Promise<boolean> {
    const payload: HabitRow = {
      id: habit.id,
      name: habit.name,
      color: habit.color,
      emoji: habit.emoji || null,
      frequency: habit.frequency,
      repeat_days: habit.repeatDays,
      type: habit.type || 'habit',
      start_date: habit.startDate || null,
      end_date: habit.endDate || null,
      time_of_day: habit.timeOfDay || null,
      reminder_time: habit.reminderTime || null,
      end_habit_date: habit.endHabitDate || null,
      end_habit_days: habit.endHabitDays || null,
      specific_dates: habit.specificDates || null,
      unit_type: habit.unitType || 'simple',
      unit: habit.unit || null,
      goal_value: habit.goalValue || null,
      timer_mode: habit.timerMode || null,
      time_unit: habit.timeUnit || null,
      history: habit.history,
      streak: habit.streak,
      created_at: habit.createdAt,
      sort_order: habit.sortOrder ?? null,
    };
    let { error } = await supabase.from('habits').upsert(payload, { onConflict: 'id' });

    // Older databases may not have sort_order until the latest migration is applied.
    if (error && error.message.includes('sort_order')) {
      const legacyPayload: Partial<HabitRow> = { ...payload };
      delete legacyPayload.sort_order;
      const fallback = await supabase.from('habits').upsert(legacyPayload, { onConflict: 'id' });
      error = fallback.error;
    }

    if (error) {
      console.warn('Error upserting habit to Supabase:', error.message);
      return false;
    }
    return true;
  },

  async deleteHabit(id: string): Promise<void> {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) {
      console.warn('Error deleting habit from Supabase:', error.message);
    }
  },

  async fetchCustomUnits(): Promise<string[]> {
    const { data, error } = await supabase.from('custom_units').select('name');
    if (error) {
      console.warn('Error fetching custom units:', error.message);
      return [];
    }
    return data ? data.map((d) => d.name) : [];
  },

  async addCustomUnit(name: string): Promise<void> {
    const { error } = await supabase.from('custom_units').upsert({ name }, { onConflict: 'name' });
    if (error) console.warn('Error adding custom unit:', error.message);
  },

  async deleteCustomUnit(name: string): Promise<void> {
    const { error } = await supabase.from('custom_units').delete().eq('name', name);
    if (error) console.warn('Error deleting custom unit:', error.message);
  },
};
