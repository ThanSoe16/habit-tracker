import { identityRevision, assertIdentityRevision } from './identity-scope';
import { supabase } from './client';

/** Cache identity is not authorization; verify the submitting session is still active. */
export async function requireIdentity(userId: string) {
  const revision = identityRevision();
  const { data, error } = await supabase.auth.getSession();
  assertIdentityRevision(revision);
  if (error || !userId || data.session?.user.id !== userId) {
    throw new Error('Your session changed. Please reload before saving.');
  }
}
