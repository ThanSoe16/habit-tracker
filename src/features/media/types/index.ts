import { z } from 'zod';

export const mediaTypeSchema = z.enum(['voice', 'photo', 'video']);
export type MediaType = z.infer<typeof mediaTypeSchema>;

export const mediaEntrySchema = z.object({
  id: z.string(),
  type: mediaTypeSchema,
  title: z.string(),
  dataUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  fileSize: z.number().nonnegative(),
  duration: z.number().nonnegative().optional(),
  mimeType: z.string(),
  createdAt: z.string(),
});

export type MediaEntry = z.infer<typeof mediaEntrySchema>;
