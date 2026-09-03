import { supabase } from '@/lib/supabase/client';
import type { MoodEntry } from '@/store/use-mood-store';

export const moodService = {
  async fetchMoods(): Promise<Record<string, MoodEntry>> {
    const { data, error } = await supabase.from('mood_entries').select('*');
    if (error) {
      console.warn('Error fetching moods from Supabase:', error.message);
      return {};
    }
    const result: Record<string, MoodEntry> = {};
    if (data) {
      for (const row of data) {
        result[row.date_key] = {
          mood: row.mood,
          label: row.label,
          emoji: row.emoji,
          tag: row.tag || undefined,
          timestamp: row.timestamp || new Date().toISOString(),
        };
      }
    }
    return result;
  },

  async upsertMood(dateKey: string, entry: MoodEntry): Promise<void> {
    const payload = {
      date_key: dateKey,
      mood: entry.mood,
      label: entry.label,
      emoji: entry.emoji,
      tag: entry.tag || null,
      timestamp: entry.timestamp,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('mood_entries')
      .upsert(payload, { onConflict: 'date_key' });
    if (error) console.warn('Error upserting mood entry to Supabase:', error.message);
  },

  async deleteAllMoods(): Promise<void> {
    const { error } = await supabase.from('mood_entries').delete().neq('date_key', '');
    if (error) console.warn('Error deleting mood entries from Supabase:', error.message);
  },
};
