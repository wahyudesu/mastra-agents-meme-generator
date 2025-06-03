import { z } from 'zod';

export const frustrationsSchema = z.object({
  frustrations: z.array(
    z.object({
      text: z.string().describe('The specific frustration mentioned'),
      category: z
        .enum([
          'meetings',
          'processes',
          'technology',
          'communication',
          'management',
          'workload',
          'other',
        ])
        .describe('Category of the frustration'),
      severity: z
        .enum(['mild', 'moderate', 'severe'])
        .describe('How severe this frustration is'),
      keywords: z
        .array(z.string())
        .describe('Key words that could be used for meme search'),
    }),
  ),
  overallMood: z
    .enum([
      'frustrated',
      'annoyed',
      'overwhelmed',
      'tired',
      'angry',
      'sarcastic',
    ])
    .describe('Overall emotional tone'),
  suggestedMemeStyle: z
    .enum([
      'classic',
      'modern',
      'corporate',
      'developer',
      'meeting',
      'remote-work',
    ])
    .describe('Suggested meme style based on frustrations'),
});