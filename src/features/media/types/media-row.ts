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
