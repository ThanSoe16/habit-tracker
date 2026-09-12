import { createSupabaseAdmin } from './admin';

export async function requestUserId(request: Request): Promise<string | null> {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;
  const { data, error } = await createSupabaseAdmin().auth.getUser(token);
  return error ? null : (data.user?.id ?? null);
}
