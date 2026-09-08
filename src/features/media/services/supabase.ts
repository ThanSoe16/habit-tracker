import { supabase } from '@/lib/supabase/client';
import {
  DataRequestError,
  readCompleteList,
  requireResult,
  textIdSchema,
} from '@/lib/supabase/request';
import { mediaEntrySchema, type MediaEntry } from '../types';
import { mediaItemRowSchema, type MediaItemRow } from '../types/media-row';
export { mediaItemRowSchema, type MediaItemRow } from '../types/media-row';

const columns =
  'id, type, title, data_url, thumbnail_url, file_size, duration, mime_type, created_at';

function mapEntry(value: unknown): MediaEntry {
  const row = mediaItemRowSchema.parse(value);
  return mediaEntrySchema.parse({
    id: row.id,
    type: row.type,
    title: row.title,
    dataUrl: row.data_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    fileSize: row.file_size ?? 0,
    duration: row.duration ?? undefined,
    mimeType: row.mime_type,
    createdAt: row.created_at,
  });
}

function mapWrite(entry: Partial<MediaEntry>): Partial<MediaItemRow> {
  return {
    type: entry.type,
    title: entry.title,
    data_url: entry.dataUrl,
    thumbnail_url: entry.thumbnailUrl,
    file_size: entry.fileSize,
    duration: entry.duration,
    mime_type: entry.mimeType,
  };
}

export const mediaItemsService = {
  // Legacy sync adapter retains its previous snapshot on null.
  async fetchMediaEntries(): Promise<MediaEntry[] | null> {
    try {
      const { data } = await readCompleteList(
        supabase
          .from('media_items')
          .select(columns, { count: 'exact' })
          .eq('user_id', 'default_user')
          .order('created_at', { ascending: false })
          .order('id'),
      );
      return data.map(mapEntry);
    } catch {
      return null;
    }
  },

  async insertMediaEntry(entry: MediaEntry): Promise<MediaEntry> {
    const validated = mediaEntrySchema.parse(entry);
    const result = await supabase
      .from('media_items')
      .upsert(
        {
          ...mapWrite(validated),
          id: textIdSchema.parse(validated.id),
          user_id: 'default_user',
          created_at: validated.createdAt,
        },
        { onConflict: 'id' },
      )
      .select(columns)
      .single();
    return mapEntry(requireResult(result, 'Could not save this file. Please try again.'));
  },

  async deleteMediaEntry(id: string): Promise<void> {
    requireResult(
      await supabase
        .from('media_items')
        .delete()
        .eq('id', textIdSchema.parse(id))
        .eq('user_id', 'default_user')
        .select('id')
        .single(),
      'Could not delete this file. Please try again.',
    );
  },

  async updateMediaEntry(id: string, updates: Partial<MediaEntry>): Promise<MediaEntry> {
    const values = mediaEntrySchema.omit({ id: true, createdAt: true }).partial().parse(updates);
    const result = await supabase
      .from('media_items')
      .update(mapWrite(values))
      .eq('id', textIdSchema.parse(id))
      .eq('user_id', 'default_user')
      .select(columns)
      .single();
    return mapEntry(requireResult(result, 'Could not update this file. Please try again.'));
  },
};

export async function uploadMediaToStorage(
  fileOrBlob: Blob | File,
  filename?: string,
): Promise<string> {
  const ext =
    filename
      ?.split('.')
      .pop()
      ?.replace(/[^a-zA-Z0-9]/g, '') ||
    (fileOrBlob.type.includes('audio')
      ? 'webm'
      : fileOrBlob.type.includes('video')
        ? 'mp4'
        : 'jpg');
  const filePath = `store/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('media_store').upload(filePath, fileOrBlob, {
    cacheControl: '3600',
    upsert: false,
    contentType: fileOrBlob.type || 'application/octet-stream',
  });
  if (error) throw new DataRequestError('Could not upload this file. Please try again.');
  const { data } = supabase.storage.from('media_store').getPublicUrl(filePath);
  if (!data.publicUrl) throw new DataRequestError('The uploaded file URL was unavailable.');
  return data.publicUrl;
}
