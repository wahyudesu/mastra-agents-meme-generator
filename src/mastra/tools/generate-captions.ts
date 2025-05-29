import { createTool } from '@mastra/core';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { frustrationsSchema } from './extract-frustrations';

// Schema for base meme template
const baseTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
  box_count: z.number()
});

// Schema for generated captions
const captionsSchema = z.object({
  topText: z.string().describe("Text for the top of the meme"),
  bottomText: z.string().describe("Text for the bottom of the meme"),
  memeStyle: z.enum([
    "classic_format", 
    "reaction", 
    "comparison", 
    "situation", 
    "advice"
  ]).describe("The style of meme this caption represents"),
  humorLevel: z.enum([
    "mild", 
    "moderate", 
    "spicy"
  ]).describe("How edgy/humorous the caption is")
});

export const generateCaptionsTools = createTool({
  id: "generate-captions",
  description: "Generate meme captions based on user frustrations and selected meme template",
  inputSchema: z.object({
    frustrations: frustrationsSchema,
    baseTemplate: baseTemplateSchema,
    style: z.enum(["workplace_safe", "casual", "sarcastic"]).optional().describe("Caption style preference")
  }),
  execute: async ({ context: { frustrations, baseTemplate, style } }) => {
    try {
      console.log(`🎨 Generating captions for "${baseTemplate.name}"...`);
      
      const captionStyle = style || "workplace_safe";
      const mainFrustration = frustrations.frustrations[0];
      const allFrustrations = frustrations.frustrations.map(f => f.text).join(", ");
      
      console.log(`📝 Caption style: ${captionStyle}`);
      console.log(`🎯 Main frustration: "${mainFrustration.text}"`);
      
      const result = await generateObject({
        model: openai('gpt-4'),
        schema: captionsSchema,
        prompt: `
          Create funny, relatable meme captions for the "${baseTemplate.name}" meme template based on these workplace frustrations:
          
          Main frustration: ${mainFrustration.text}
          All frustrations: ${allFrustrations}
          Overall mood: ${frustrations.overallMood}
          Keywords: ${frustrations.frustrations.flatMap(f => f.keywords).join(", ")}
          
          Meme template context: "${baseTemplate.name}" typically has ${baseTemplate.box_count} text areas.
          
          Caption style: ${captionStyle}
          
          Guidelines:
          - Keep text concise and punchy (memes work best with short text)
          - Make it relatable to office workers
          - Capture the ${frustrations.overallMood} mood
          - Use appropriate humor level for ${captionStyle} setting
          - Consider the typical format of "${baseTemplate.name}" memes
          - Top text usually sets up the situation, bottom text delivers the punchline
          - Make it shareable and not offensive
          
          Generate one perfect caption pair.
        `
      });
      
      const captions = result.object;
      
      console.log(`✅ Generated captions: "${captions.topText}" / "${captions.bottomText}"`);
      
      const finalResult = {
        ...captions,
        baseTemplate: baseTemplate.name,
        frustrationContext: {
          mainFrustration: mainFrustration.text,
          mood: frustrations.overallMood
        },
        generationStyle: captionStyle,
        analysis: {
          message: `Created captions: "${captions.topText}" / "${captions.bottomText}"`
        }
      };
      
      return {
        success: true,
        data: finalResult
      };
    } catch (error) {
      console.error('Error generating captions:', error);
      return {
        success: false,
        error: 'Failed to generate meme captions',
        data: null
      };
    }
  }
}); 