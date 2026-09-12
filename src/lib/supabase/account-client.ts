import { createClient } from '@supabase/supabase-js';
import { supabase } from './client';
import { identityRevision, isIdentityRevisionCurrent } from './identity-scope';

/** Bind a whole service operation to its submitting session, including later requests. */
export const accountService = {
  async getClient() {
    const revision = identityRevision();
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session || !isIdentityRevisionCurrent(revision)) {
      throw new Error('Your session changed. Please sign in again.');
    }
    const { access_token, user } = data.session;
    return {
      userId: user.id,
      supabase: createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder',
        {
          global: {
            fetch: async (input, init) => {
              if (!isIdentityRevisionCurrent(revision)) throw new Error('Your session changed.');
              const response = await fetch(input, init);
              if (!isIdentityRevisionCurrent(revision)) throw new Error('Your session changed.');
              return response;
            },
          },
          accessToken: async () => {
            if (!isIdentityRevisionCurrent(revision)) throw new Error('Your session changed.');
            return access_token;
          },
        },
      ),
    };
  },
};
