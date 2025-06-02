import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { frustrationsSchema, memeTemplateSchema, captionsSchema } from '../schemas';

export const generateCaptionsStep = createStep({
  id: "generate-captions",
  description: "Generate meme captions based on user frustrations and selected meme template",
  inputSchema: z.object({
    frustrations: frustrationsSchema,
    baseTemplate: memeTemplateSchema
  }),
  outputSchema: captionsSchema.extend({
    baseTemplate: z.string(),
    frustrationContext: z.object({
      mainFrustration: z.string(),
      mood: z.string()
    }),
    generationStyle: z.string(),
    analysis: z.object({
      message: z.string()
    })
  }),
  execute: async ({ inputData }) => {
    try {
      console.log(`🎨 Generating captions for "${inputData.baseTemplate.name}"...`);
      
      const captionStyle = "workplace_safe";
      const mainFrustration = inputData.frustrations.frustrations[0];
      const allFrustrations = inputData.frustrations.frustrations.map(f => f.text).join(", ");
      
      console.log(`📝 Caption style: ${captionStyle}`);
      console.log(`🎯 Main frustration: "${mainFrustration.text}"`);
      
      const result = await generateObject({
        model: openai('gpt-4'),
        schema: captionsSchema,
        prompt: `
          Create funny, relatable meme captions for the "${inputData.baseTemplate.name}" meme template based on these workplace frustrations:
          
          Main frustration: ${mainFrustration.text}
          All frustrations: ${allFrustrations}
          Overall mood: ${inputData.frustrations.overallMood}
          Keywords: ${inputData.frustrations.frustrations.flatMap(f => f.keywords).join(", ")}
          
          Meme template context: "${inputData.baseTemplate.name}" typically has ${inputData.baseTemplate.box_count} text areas.
          
          Caption style: ${captionStyle}
          
          Guidelines:
          - Keep text concise and punchy (memes work best with short text)
          - Make it relatable to office workers
          - Capture the ${inputData.frustrations.overallMood} mood
          - Use appropriate humor level for ${captionStyle} setting
          - Consider the typical format of "${inputData.baseTemplate.name}" memes
          - Top text usually sets up the situation, bottom text delivers the punchline
          - Make it shareable and not offensive
          
          Generate one perfect caption pair.
        `
      });
      
      const captions = result.object;
      
      console.log(`✅ Generated captions: "${captions.topText}" / "${captions.bottomText}"`);
      
      return {
        ...captions,
        baseTemplate: inputData.baseTemplate.name,
        frustrationContext: {
          mainFrustration: mainFrustration.text,
          mood: inputData.frustrations.overallMood
        },
        generationStyle: captionStyle,
        analysis: {
          message: `Created captions: "${captions.topText}" / "${captions.bottomText}"`
        }
      };
    } catch (error) {
      console.error('Error generating captions:', error);
      throw new Error('Failed to generate meme captions');
    }
  }
}); 