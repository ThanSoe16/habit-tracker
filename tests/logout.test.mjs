import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authService } from '../src/lib/supabase/auth.ts';
import { supabase } from '../src/lib/supabase/client.ts';

test('logout reports a rejected sign-out so the dialog can stay open for retry', async (t) => {
  const error = new Error('Network unavailable');
  const signOut = t.mock.method(supabase.auth, 'signOut', async () => ({ error }));
  await assert.rejects(authService.signOut(), (actual) => actual === error);
  assert.equal(signOut.mock.callCount(), 1);
});

test('logout completes after Supabase successfully ends the session', async (t) => {
  const signOut = t.mock.method(supabase.auth, 'signOut', async () => ({ error: null }));
  await authService.signOut();
  assert.equal(signOut.mock.callCount(), 1);
});
