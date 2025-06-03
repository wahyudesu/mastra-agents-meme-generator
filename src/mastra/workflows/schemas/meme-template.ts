import { z } from 'zod';

// Schema for meme template
export const memeTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
  box_count: z.number(),
});
