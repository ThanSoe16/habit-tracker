import { z } from 'zod';
import { listPage, pageRange } from '@/lib/supabase/pagination';
import { accountService } from '@/lib/supabase/account-client';
import { readCompleteList, requireResult, textIdSchema } from '@/lib/supabase/request';
import { habitRecordSchema, type Habit } from '../types';
import { mapHabitRow, type HabitRow } from '../types/habit-row';
export { habitRowSchema, type HabitRow } from '../types/habit-row';

const columns =
  'id, name, color, emoji, frequency, repeat_days, type, habit_kind, start_date, end_date, time_of_day, reminder_time, reminder_snooze_minutes, end_habit_date, end_habit_days, specific_dates, unit_type, unit, goal_value, timer_mode, time_unit, history, streak, sort_order, created_at';

export const habitsService = {
  async list(page: number, signal: AbortSignal, type?: 'habit' | 'task') {
    const range = pageRange(page);
    const { supabase } = await accountService.getClient();
    let request = supabase.from('habits').select(columns, { count: 'exact' });
    if (type === 'task') request = request.eq('type', 'task');
    if (type === 'habit') request = request.or('type.eq.habit,type.is.null');
    const result = listPage(
      await request
        .order('sort_order')
        .order('id')
        .range(...range)
        .abortSignal(signal),
      page,
    );
    return { ...result, rows: result.rows.map(mapHabitRow) };
  },

  async listSelected(ids: string[], page: number, signal: AbortSignal) {
    const [from, to] = pageRange(page);
    const selectedIds = ids.slice(from, to + 1);
    if (!selectedIds.length) return { rows: [], total: ids.length, nextPage: undefined };
    const { supabase } = await accountService.getClient();
    const result = await supabase
      .from('habits')
      .select(columns)
      .in('id', selectedIds)
      .order('sort_order')
      .order('id')
      .range(0, 9)
      .abortSignal(signal);
    const rows = requireResult(result).map(mapHabitRow);
    const byId = new Map(rows.map((row) => [row.id, row]));
    return {
      rows: selectedIds.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])),
      total: ids.length,
      nextPage: to + 1 < ids.length ? page + 1 : undefined,
    };
  },

  async detail(id: string, signal?: AbortSignal): Promise<Habit | null> {
    const { supabase } = await accountService.getClient();
    let request = supabase.from('habits').select(columns).eq('id', textIdSchema.parse(id));
    if (signal) request = request.abortSignal(signal);
    const result = await request.maybeSingle();
    if (result.error) throw new Error('Could not load the habit. Please try again.');
    return result.data ? mapHabitRow(result.data) : null;
  },

  /** Calendar/reminder projections omit the unbounded history JSON. */
  async summary(dates: string[], remindersOnly: boolean, signal: AbortSignal) {
    dates.forEach((date) => z.string().date().parse(date));
    const { supabase } = await accountService.getClient();
    const selected = [
      columns.replace('history, ', ''),
      ...dates.map((date, i) => `day${i}:history->${date}`),
    ].join(',');
    let request = supabase
      .from('habits')
      .select(selected, { count: 'exact' })
      .order('sort_order')
      .order('id')
      .abortSignal(signal);
    if (remindersOnly) request = request.not('reminder_time', 'is', null).neq('reminder_time', '');
    const { data } = await readCompleteList(request);
    return data.map((value: unknown) => {
      const row = z.record(z.unknown()).parse(value);
      const history = Object.fromEntries(
        dates.flatMap((date, i) => (row[`day${i}`] == null ? [] : [[date, row[`day${i}`]]])),
      );
      return mapHabitRow({ ...row, history });
    });
  },

  async nextSortOrder() {
    const { supabase } = await accountService.getClient();
    const result = await supabase
      .from('habits')
      .select('sort_order')
      .order('sort_order', { ascending: false, nullsFirst: false })
      .limit(1);
    const rows = requireResult(result);
    return (rows[0]?.sort_order ?? -1) + 1;
  },

  // Legacy background-sync adapter: null retains the last valid snapshot.
  async fetchHabits(): Promise<Habit[] | null> {
    const { supabase } = await accountService.getClient();
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
    const { supabase } = await accountService.getClient();
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
    const { supabase } = await accountService.getClient();
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
    const { supabase } = await accountService.getClient();
    const { data } = await readCompleteList(
      supabase.from('custom_units').select('name', { count: 'exact' }).order('name'),
    );
    return data.map((row) => row.name);
  },

  // Bulk synchronization callers intentionally use nonthrowing boolean outcomes.
  async addCustomUnit(name: string): Promise<boolean> {
    const { supabase } = await accountService.getClient();
    const { data, error } = await supabase
      .from('custom_units')
      .upsert({ name: textIdSchema.parse(name) }, { onConflict: 'user_id,name' })
      .select('name')
      .single();
    return !error && Boolean(data);
  },

  async deleteCustomUnit(name: string): Promise<boolean> {
    const { supabase } = await accountService.getClient();
    const { data, error } = await supabase
      .from('custom_units')
      .delete()
      .eq('name', textIdSchema.parse(name))
      .select('name')
      .single();
    return !error && Boolean(data);
  },
};
