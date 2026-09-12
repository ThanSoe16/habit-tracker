import type { SupabaseClient } from '@supabase/supabase-js';

/** Keep durable object references in rows, resolving temporary access URLs for display. */
function mediaObject(value: string): { bucket: string; path: string } | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !value.startsWith(`${base}/storage/v1/object/`)) return null;
  const match = new URL(value).pathname.match(
    /^\/storage\/v1\/object\/(?:public|sign)\/(media_store|workout-images)\/(.+)$/,
  );
  return match ? { bucket: match[1], path: decodeURIComponent(match[2]) } : null;
}

export function durableMediaUrl(client: SupabaseClient, value: string): string {
  const object = mediaObject(value);
  return object
    ? client.storage.from(object.bucket).getPublicUrl(object.path).data.publicUrl
    : value;
}

export async function resolveMediaUrl(client: SupabaseClient, value: string): Promise<string> {
  const object = mediaObject(value);
  if (!object) return value;
  const { data, error } = await client.storage
    .from(object.bucket)
    .createSignedUrl(object.path, 3600);
  if (error || !data?.signedUrl)
    throw new Error('Could not load this private file. Please refresh.');
  return data.signedUrl;
}

/** Workout plans/history embed image URLs inside JSON; process those references too. */
export async function resolveMediaTree<T>(client: SupabaseClient, value: T): Promise<T> {
  if (typeof value === 'string') return (await resolveMediaUrl(client, value)) as T;
  if (Array.isArray(value))
    return (await Promise.all(value.map((item) => resolveMediaTree(client, item)))) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(value).map(async ([key, item]) => [
          key,
          await resolveMediaTree(client, item),
        ]),
      ),
    ) as T;
  }
  return value;
}

export function durableMediaTree<T>(client: SupabaseClient, value: T): T {
  if (typeof value === 'string') return durableMediaUrl(client, value) as T;
  if (Array.isArray(value)) return value.map((item) => durableMediaTree(client, item)) as T;
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, durableMediaTree(client, item)]),
    ) as T;
  return value;
}
