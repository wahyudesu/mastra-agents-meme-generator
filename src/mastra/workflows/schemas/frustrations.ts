import { z } from 'zod';

// Schema for structured frustration extraction
export const frustrationsSchema = z.object({
  frustrations: z.array(
    z.object({
      frustration: z.string().describe('A specific work frustration mentioned'),
      category: z
        .enum(['meetings', 'tools', 'communication', 'process', 'other'])
        .describe('Category of the frustration'),
      intensity: z
        .enum(['mild', 'moderate', 'severe'])
        .describe('How intense the frustration seems'),
    }),
  ),
  analysis: z.object({
    message: z.string().describe('A brief empathetic acknowledgment'),
    dominantTheme: z.string().describe('The main theme across frustrations'),
  }),
});