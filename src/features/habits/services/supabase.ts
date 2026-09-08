import { supabase } from '@/lib/supabase/client';
import { readCompleteList, requireResult, textIdSchema } from '@/lib/supabase/request';
import { habitRecordSchema, type Habit } from '../types';
import { mapHabitRow, type HabitRow } from '../types/habit-row';
export { habitRowSchema, type HabitRow } from '../types/habit-row';

const columns =
  'id, name, color, emoji, frequency, repeat_days, type, habit_kind, start_date, end_date, time_of_day, reminder_time, reminder_snooze_minutes, end_habit_date, end_habit_days, specific_dates, unit_type, unit, goal_value, timer_mode, time_unit, history, streak, sort_order, created_at';

export const habitsService = {
  // Legacy background-sync adapter: null retains the last valid snapshot.
  async fetchHabits(): Promise<Habit[] | null> {
    try {
      const { data } = await readCompleteList(
        supabase.from('habits').select(columns, { count: 'exact' }).order('sort_order').order('id'),
      );
      return data.map(mapHabitRow);
    } catch {
      return null;
    }
  },

  async saveHabit(habit: Habit): Promise<Habit> {
    const validated = habitRecordSchema.parse(habit);
    const payload: HabitRow = {
      id: validated.id,
      name: validated.name,
      color: validated.color,
      emoji: validated.emoji || null,
      frequency: validated.frequency,
      repeat_days: validated.repeatDays,
      type: validated.type || 'habit',
      habit_kind: validated.habitKind || 'build',
      start_date: validated.startDate || null,
      end_date: validated.endDate || null,
      time_of_day: validated.timeOfDay || null,
      reminder_time: validated.reminderTime || null,
      reminder_snooze_minutes: validated.reminderSnoozeMinutes || 10,
      end_habit_date: validated.endHabitDate || null,
      end_habit_days: validated.endHabitDays || null,
      specific_dates: validated.specificDates || null,
      unit_type: validated.unitType || 'simple',
      unit: validated.unit || null,
      goal_value: validated.goalValue || null,
      timer_mode: validated.timerMode || null,
      time_unit: validated.timeUnit || null,
      history: validated.history,
      streak: validated.streak,
      created_at: validated.createdAt,
      sort_order: validated.sortOrder ?? null,
    };
    const result = await supabase
      .from('habits')
      .upsert(payload, { onConflict: 'id' })
      .select(columns)
      .single();
    return mapHabitRow(requireResult(result, 'Could not save the habit. Please try again.'));
  },

  // Existing optimistic completion/reordering callers use a nonthrowing adapter.
  async upsertHabit(habit: Habit): Promise<boolean> {
    try {
      await habitsService.saveHabit(habit);
      return true;
    } catch {
      return false;
    }
  },

  async deleteHabit(id: string): Promise<boolean> {
    const recordId = textIdSchema.parse(id);
    const { data, error } = await supabase
      .from('habits')
      .delete()
      .eq('id', recordId)
      .select('id')
      .single();
    return !error && Boolean(data);
  },

  async fetchCustomUnits(): Promise<string[]> {
    const { data } = await readCompleteList(
      supabase.from('custom_units').select('name', { count: 'exact' }).order('name'),
    );
    return data.map((row) => row.name);
  },

  // Bulk synchronization callers intentionally use nonthrowing boolean outcomes.
  async addCustomUnit(name: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('custom_units')
      .upsert({ name: textIdSchema.parse(name) }, { onConflict: 'name' })
      .select('name')
      .single();
    return !error && Boolean(data);
  },

  async deleteCustomUnit(name: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('custom_units')
      .delete()
      .eq('name', textIdSchema.parse(name))
      .select('name')
      .single();
    return !error && Boolean(data);
  },
};
