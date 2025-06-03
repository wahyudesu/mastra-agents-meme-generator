import { createStep } from '@mastra/core/workflows';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { frustrationsSchema } from '../schemas';

export const extractFrustrationsStep = createStep({
  id: 'extract-frustrations',
  description: 'Extract and categorize user frustrations from raw input',
  inputSchema: z.object({
    userInput: z.string().describe('Raw user input about work frustrations'),
  }),
  outputSchema: frustrationsSchema,
  execute: async ({ inputData }) => {
    console.log('🔍 Analyzing frustrations from user input...');

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: frustrationsSchema,
      prompt: `You are an empathetic AI that understands workplace frustrations.
      
Extract and categorize the frustrations from this user input:
"${inputData.userInput}"

Analyze each frustration mentioned and categorize it appropriately.
Be understanding and acknowledge their feelings.`,
    });

    console.log('✅ Frustrations extracted:', result.object.frustrations.length);
    return result.object;
  },
});