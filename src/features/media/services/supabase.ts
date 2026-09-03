import { supabase } from '@/lib/supabase/client';
import type { MediaEntry } from '@/store/use-media-store';
import { z } from 'zod';

export const mediaItemRowSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  type: z.enum(['voice', 'photo', 'video']),
  title: z.string(),
  data_url: z.string(),
  thumbnail_url: z.string().nullish(),
  file_size: z.number().nullish(),
  duration: z.number().nullish(),
  mime_type: z.string(),
  created_at: z.string().optional(),
});

export type MediaItemRow = z.infer<typeof mediaItemRowSchema>;

export const mediaItemsService = {
  async fetchMediaEntries(): Promise<MediaEntry[] | null> {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('user_id', 'default_user')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching media_items from Supabase:', error.message);
      return null;
    }
    if (!data) return [];
    return data.map((value) => {
      const row = mediaItemRowSchema.parse(value);
      return {
        id: row.id || '',
        type: row.type,
        title: row.title,
        dataUrl: row.data_url,
        thumbnailUrl: row.thumbnail_url || undefined,
        fileSize: Number(row.file_size || 0),
        duration: row.duration ? Number(row.duration) : undefined,
        mimeType: row.mime_type,
        createdAt: row.created_at || new Date().toISOString(),
      };
    });
  },

  async insertMediaEntry(entry: MediaEntry): Promise<MediaEntry | null> {
    const payload: MediaItemRow = {
      id: entry.id,
      user_id: 'default_user',
      type: entry.type,
      title: entry.title,
      data_url: entry.dataUrl,
      thumbnail_url: entry.thumbnailUrl || null,
      file_size: entry.fileSize,
      duration: entry.duration || null,
      mime_type: entry.mimeType,
      created_at: entry.createdAt,
    };

    const { data, error } = await supabase
      .from('media_items')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      console.warn('Error inserting media item:', error.message);
      return entry;
    }
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      dataUrl: data.data_url,
      thumbnailUrl: data.thumbnail_url || undefined,
      fileSize: Number(data.file_size || 0),
      duration: data.duration ? Number(data.duration) : undefined,
      mimeType: data.mime_type,
      createdAt: data.created_at || new Date().toISOString(),
    };
  },

  async deleteMediaEntry(id: string): Promise<void> {
    const { error } = await supabase.from('media_items').delete().eq('id', id);
    if (error) console.warn('Error deleting media item:', error.message);
  },

  async updateMediaEntry(id: string, updates: Partial<MediaEntry>): Promise<void> {
    const payload: Partial<MediaItemRow> = {};
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.dataUrl !== undefined) payload.data_url = updates.dataUrl;
    if (updates.thumbnailUrl !== undefined) payload.thumbnail_url = updates.thumbnailUrl || null;
    if (updates.fileSize !== undefined) payload.file_size = updates.fileSize;
    if (updates.duration !== undefined) payload.duration = updates.duration;
    if (updates.mimeType !== undefined) payload.mime_type = updates.mimeType;
    if (updates.createdAt !== undefined) payload.created_at = updates.createdAt;

    const { error } = await supabase.from('media_items').update(payload).eq('id', id);
    if (error) console.warn('Error updating media item:', error.message);
  },
};

/**
 * Uploads a media File or Blob to Supabase Storage bucket 'media_store'
 * and returns the clean public URL (e.g. https://.../storage/v1/object/public/media_store/...)
 */
export async function uploadMediaToStorage(
  fileOrBlob: Blob | File,
  filename?: string,
): Promise<string> {
  try {
    const ext =
      filename?.split('.').pop() ||
      (fileOrBlob.type.includes('audio')
        ? 'webm'
        : fileOrBlob.type.includes('video')
          ? 'mp4'
          : 'jpg');
    const filePath = `store/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { error } = await supabase.storage.from('media_store').upload(filePath, fileOrBlob, {
      cacheControl: '3600',
      upsert: false,
      contentType: fileOrBlob.type || 'application/octet-stream',
    });

    if (error) {
      console.warn('Supabase storage upload warning:', error.message);
    }

    const { data: publicUrlData } = supabase.storage.from('media_store').getPublicUrl(filePath);

    return publicUrlData?.publicUrl || '';
  } catch (err) {
    console.error('Storage upload error:', err);
    return '';
  }
}

/**
 * Supabase service for syncing Budget data across 6 dedicated tables:
 * 1. current_budget (wallets)
 * 2. family_budgets
 * 3. incomes
 * 4. expenses
 * 5. monthly_salary
 * 6. budget_settings
 */
