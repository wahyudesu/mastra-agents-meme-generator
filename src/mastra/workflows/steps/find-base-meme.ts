import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { frustrationsSchema, memeTemplateSchema } from '../schemas';

export const findBaseMemeStep = createStep({
  id: "find-base-meme",
  description: "Get a diverse selection of meme templates from Imgflip's free API",
  inputSchema: frustrationsSchema.extend({
    analysis: z.object({
      message: z.string()
    })
  }),
  outputSchema: z.object({
    templates: z.array(memeTemplateSchema),
    searchCriteria: z.object({
      categories: z.array(z.string()),
      mood: z.string(),
      style: z.string()
    }),
    totalAvailable: z.number(),
    matchingStrategy: z.string(),
    analysis: z.object({
      message: z.string()
    })
  }),
  execute: async ({ inputData }) => {
    try {
      console.log("🔍 Fetching diverse meme templates from Imgflip...");
      
      // Get popular memes from Imgflip's free API
      const response = await fetch('https://api.imgflip.com/get_memes');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch memes from Imgflip');
      }
      
      const allMemes = data.data.memes;
      console.log(`📚 Found ${allMemes.length} available meme templates`);
      
      // Instead of restrictive filtering, get a diverse selection
      // Shuffle the array to get variety and take more memes
      const shuffledMemes = [...allMemes].sort(() => Math.random() - 0.5);
      
      // Take a good selection (10 memes instead of just 3)
      const selectedMemes = shuffledMemes.slice(0, 10).map((meme: any) => ({
        id: meme.id,
        name: meme.name,
        url: meme.url,
        width: meme.width,
        height: meme.height,
        box_count: meme.box_count
      }));
      
      console.log(`✅ Selected ${selectedMemes.length} diverse meme templates`);
      console.log(`🎯 Templates: ${selectedMemes.map(m => m.name).join(', ')}`);
      
      return {
        templates: selectedMemes,
        searchCriteria: {
          categories: inputData.frustrations.map((f) => f.category),
          mood: inputData.overallMood,
          style: inputData.suggestedMemeStyle
        },
        totalAvailable: allMemes.length,
        matchingStrategy: 'diverse_selection',
        analysis: {
          message: `Selected ${selectedMemes.length} diverse templates from ${allMemes.length} available options!`
        }
      };
    } catch (error) {
      console.error('Error finding base memes:', error);
      throw new Error('Failed to search for meme templates');
    }
  }
}); 