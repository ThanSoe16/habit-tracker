import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(6, 'Use at least 6 characters.').max(128),
});
