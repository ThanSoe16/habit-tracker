import { readCompleteList, requireResult, DataRequestError } from '@/lib/supabase/request';
import { moodEntrySchema, moodRowSchema } from '../types';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import type { MoodEntry } from '@/features/mood/types';

const moodColumns = 'date_key, mood, label, emoji, tag, timestamp';
const moodColumnsWithNotes = `${moodColumns}, note`;

async function getMoodColumns(): Promise<string> {
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
  async fetchMoods(): Promise<Record<string, MoodEntry>> {
    const columns = await getMoodColumns();
    const { data } = await readCompleteList(
      supabase.from('mood_entries').select(columns, { count: 'exact' }).order('date_key'),
    );
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
    z.string().date().parse(dateKey);
    const validated = moodEntrySchema.parse(entry);
    const columns = await getMoodColumns();
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
      .upsert(payload, { onConflict: 'date_key' })
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
    const { error } = await supabase.from('mood_entries').delete().neq('date_key', '');
    // Intentionally idempotent bulk clear; an empty history is already cleared.
    if (error) throw new DataRequestError('Could not clear your mood history.', error);
  },
};
