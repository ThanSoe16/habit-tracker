import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseAdminEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export const createSupabaseAdmin = () => {
  const env = supabaseAdminEnvSchema.parse(process.env);

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
