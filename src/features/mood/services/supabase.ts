import { listPage, pageRange } from '@/lib/supabase/pagination';
import { readCompleteList, requireResult, DataRequestError } from '@/lib/supabase/request';
import { moodEntrySchema, moodRowSchema } from '../types';
import { z } from 'zod';
import { accountService } from '@/lib/supabase/account-client';
import type { MoodEntry } from '@/features/mood/types';

const moodColumns = 'date_key, mood, label, emoji, tag, timestamp';
const moodColumnsWithNotes = `${moodColumns}, note`;

async function getMoodColumns(
  supabase: Awaited<ReturnType<typeof accountService.getClient>>['supabase'],
): Promise<string> {
  // Older deployments predate the optional reflection-note migration.
  const { error } = await supabase.from('mood_entries').select('note').range(0, 0);
  if (error?.code === '42703') return moodColumns;
  if (error) throw new DataRequestError('Could not load your moods. Please try again.', error);
  return moodColumnsWithNotes;
}

function parseMoodRow(value: unknown) {
  const parsed = moodRowSchema.safeParse(value);
  if (!parsed.success) throw new DataRequestError('The mood data was incomplete. Please refresh.');
  return parsed.data;
}

export const moodService = {
  async list(page: number, signal: AbortSignal) {
    const range = pageRange(page);
    const { supabase } = await accountService.getClient();
    const columns = await getMoodColumns(supabase);
    const result = listPage(
      await supabase
        .from('mood_entries')
        .select(columns, { count: 'exact' })
        .order('date_key', { ascending: false })
        .range(...range)
        .abortSignal(signal),
      page,
    );
    return { ...result, rows: result.rows.map(parseMoodRow) };
  },
  async dates(signal: AbortSignal) {
    const { supabase } = await accountService.getClient();
    const result = await readCompleteList(
      supabase
        .from('mood_entries')
        .select('date_key', { count: 'exact' })
        .order('date_key')
        .abortSignal(signal),
    );
    return result.data.map((row) => row.date_key as string);
  },
  async fetchMoods(
    from?: string,
    to?: string,
    signal?: AbortSignal,
  ): Promise<Record<string, MoodEntry>> {
    const { supabase } = await accountService.getClient();
    const columns = await getMoodColumns(supabase);
    let request = supabase
      .from('mood_entries')
      .select(columns, { count: 'exact' })
      .order('date_key');
    if (from) request = request.gte('date_key', z.string().date().parse(from));
    if (to) request = request.lte('date_key', z.string().date().parse(to));
    if (signal) request = request.abortSignal(signal);
    const { data } = await readCompleteList(request);
    const result: Record<string, MoodEntry> = {};
    if (data) {
      for (const value of data) {
        const row = parseMoodRow(value);
        result[row.date_key] = {
          mood: row.mood,
          label: row.label,
          emoji: row.emoji,
          tag: row.tag || undefined,
          note: row.note || undefined,
          timestamp: row.timestamp || new Date().toISOString(),
        };
      }
    }
    return result;
  },

  async upsertMood(dateKey: string, entry: MoodEntry): Promise<MoodEntry> {
    const { supabase } = await accountService.getClient();
    z.string().date().parse(dateKey);
    const validated = moodEntrySchema.parse(entry);
    const columns = await getMoodColumns(supabase);
    const supportsNotes = columns === moodColumnsWithNotes;
    if (!supportsNotes && validated.note?.trim()) {
      throw new DataRequestError(
        'Reflection notes are unavailable. Your entry has not been saved.',
      );
    }
    const payload = {
      date_key: dateKey,
      mood: validated.mood,
      label: validated.label,
      emoji: validated.emoji,
      tag: validated.tag || null,
      ...(supportsNotes && validated.note !== undefined ? { note: validated.note } : {}),
      timestamp: validated.timestamp,
      updated_at: new Date().toISOString(),
    };
    const result = await supabase
      .from('mood_entries')
      .upsert(payload, { onConflict: 'user_id,date_key' })
      .select(columns)
      .single();
    const row = parseMoodRow(requireResult(result, 'Could not save your mood. Please try again.'));
    return moodEntrySchema.parse({
      ...row,
      tag: row.tag ?? undefined,
      note: row.note ?? undefined,
    });
  },

  async deleteAllMoods(): Promise<void> {
    const { supabase } = await accountService.getClient();
    const { error } = await supabase.from('mood_entries').delete().neq('date_key', '');
    // Intentionally idempotent bulk clear; an empty history is already cleared.
    if (error) throw new DataRequestError('Could not clear your mood history.', error);
  },
};
