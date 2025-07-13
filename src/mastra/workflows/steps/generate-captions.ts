import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { generateObject } from 'ai';
// import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';

import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
    baseURL: "https://ai.sumopod.com/v1",
});

// const model = groq('gemma2-9b-it');

import { frustrationsSchema, memeTemplateSchema, captionsSchema } from '../schemas';

export const generateCaptionsStep = createStep({
  id: 'generate-captions',
  description: 'Generate funny captions based on frustrations and meme template',
  inputSchema: z.object({
    frustrations: frustrationsSchema,
    baseTemplate: memeTemplateSchema,
  }),
  outputSchema: captionsSchema,
  execute: async ({ inputData }) => {
    try {
      console.log(
        `🎨 Generating captions for ${inputData.baseTemplate.name} meme...`
      );

      const mainFrustration = inputData.frustrations.frustrations[0];
      const mood = inputData.frustrations.overallMood;

      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: captionsSchema,
        prompt: `
          Create meme captions for the "${inputData.baseTemplate.name}" meme template.
          
          Context:
          - Frustration: ${mainFrustration.text}
          - Category: ${mainFrustration.category}
          - Mood: ${mood}
          - Meme has ${inputData.baseTemplate.box_count} text boxes
          
          Make it funny and relatable to office workers. The humor should match the ${mood} mood.
          Keep text concise for meme format. Be creative but workplace-appropriate.
        `,
      });

      console.log('✅ Captions generated successfully');
      return result.object;
    } catch (error) {
      console.error('Error generating captions:', error);
      throw new Error('Failed to generate captions');
    }
  },
});