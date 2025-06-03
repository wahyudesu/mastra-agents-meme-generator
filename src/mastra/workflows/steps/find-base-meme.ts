import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { frustrationsSchema, memeTemplateSchema } from '../schemas';

export const findBaseMemeStep = createStep({
  id: 'find-base-meme',
  description:
    "Search for appropriate meme templates based on user frustrations using Imgflip's free API",
  inputSchema: frustrationsSchema.extend({
    analysis: z.object({
      message: z.string(),
    }),
  }),
  outputSchema: z.object({
    templates: z.array(memeTemplateSchema),
    searchCriteria: z.object({
      categories: z.array(z.string()),
      mood: z.string(),
      style: z.string(),
    }),
    totalAvailable: z.number(),
    matchingStrategy: z.string(),
    analysis: z.object({
      message: z.string(),
    }),
  }),
  execute: async ({ inputData }) => {
    try {
      console.log('🔍 Searching for the perfect meme templates...');

      // Get popular memes from Imgflip's free API
      const response = await fetch('https://api.imgflip.com/get_memes');
      const data = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch memes from Imgflip');
      }

      const allMemes = data.data.memes;
      console.log(`📚 Found ${allMemes.length} available meme templates`);

      // Enhanced mapping of frustration categories to relevant meme templates
      const categoryMemeMap: Record<string, string[]> = {
        meetings: [
          'Distracted Boyfriend',
          'Drake Pointing',
          'This Is Fine',
          'Boardroom Meeting Suggestion',
          'Expanding Brain',
          'Two Buttons',
          'Change My Mind',
          'Disaster Girl',
        ],
        processes: [
          'This Is Fine',
          'Expanding Brain',
          'Drake Pointing',
          'Change My Mind',
          'Disaster Girl',
          'Confused Screaming',
          'Picard Facepalm',
          'Y U No',
        ],
        technology: [
          'This Is Fine',
          'Drake Pointing',
          'Expanding Brain',
          'Confused Screaming',
          'Y U No',
          'Picard Facepalm',
          'Disaster Girl',
          'Success Kid',
        ],
        communication: [
          'Distracted Boyfriend',
          'Drake Pointing',
          'Two Buttons',
          'Change My Mind',
          'Confused Screaming',
          'Picard Facepalm',
          'Y U No',
          'Hide the Pain Harold',
        ],
        management: [
          'Boardroom Meeting Suggestion',
          'Drake Pointing',
          'Distracted Boyfriend',
          'This Is Fine',
          'Change My Mind',
          'Picard Facepalm',
          'Disaster Girl',
          'Y U No',
        ],
        workload: [
          'This Is Fine',
          'Drake Pointing',
          'Expanding Brain',
          'Disaster Girl',
          'Confused Screaming',
          'Y U No',
          'Picard Facepalm',
          'Hide the Pain Harold',
        ],
        other: [
          'Drake Pointing',
          'This Is Fine',
          'Distracted Boyfriend',
          'Change My Mind',
          'Expanding Brain',
          'Two Buttons',
          'Disaster Girl',
          'Success Kid',
        ],
      };

      // Get relevant meme names based on frustration categories
      const relevantMemeNames = new Set<string>();
      inputData.frustrations.forEach(frustration => {
        const categoryMemes =
          categoryMemeMap[frustration.category] || categoryMemeMap.other;
        categoryMemes.forEach(name =>
          relevantMemeNames.add(name.toLowerCase()),
        );
      });

      console.log(
        `🎯 Targeting memes for categories: ${inputData.frustrations.map(f => f.category).join(', ')}`,
      );

      // Enhanced filtering with fuzzy matching
      let filteredMemes = allMemes.filter((meme: any) => {
        const memeName = meme.name.toLowerCase();

        // Direct name matching
        if (
          Array.from(relevantMemeNames).some(
            relevantName =>
              memeName.includes(relevantName) ||
              relevantName.includes(memeName),
          )
        ) {
          return true;
        }

        // Keyword matching from frustrations
        const allKeywords = inputData.frustrations
          .flatMap(f => f.keywords)
          .map(k => k.toLowerCase());
        return allKeywords.some(keyword => memeName.includes(keyword));
      });

      let matchingStrategy = 'category_match';

      // If no specific matches, fall back to popular memes based on mood
      if (filteredMemes.length === 0) {
        console.log('🔄 No direct matches found, searching by mood...');
        const moodMemeMap: Record<string, string[]> = {
          frustrated: ['This Is Fine', 'Y U No', 'Picard Facepalm'],
          annoyed: ['Drake Pointing', 'Y U No', 'Confused Screaming'],
          overwhelmed: ['This Is Fine', 'Disaster Girl', 'Confused Screaming'],
          tired: ['Hide the Pain Harold', 'This Is Fine', 'Picard Facepalm'],
          angry: ['Y U No', 'Disaster Girl', 'Confused Screaming'],
          sarcastic: [
            'Drake Pointing',
            'Distracted Boyfriend',
            'Change My Mind',
          ],
        };

        const moodMemes =
          moodMemeMap[inputData.overallMood] || moodMemeMap.frustrated;
        filteredMemes = allMemes.filter((meme: any) =>
          moodMemes.some(moodMeme =>
            meme.name.toLowerCase().includes(moodMeme.toLowerCase()),
          ),
        );
        matchingStrategy = 'mood_match';
      }

      // Final fallback to most popular memes
      if (filteredMemes.length === 0) {
        console.log('🔄 Using popular memes as fallback...');
        filteredMemes = allMemes.slice(0, 10);
        matchingStrategy = 'popular_fallback';
      }

      // Sort by relevance and limit results
      const selectedMemes = filteredMemes.slice(0, 3).map((meme: any) => ({
        id: meme.id,
        name: meme.name,
        url: meme.url,
        width: meme.width,
        height: meme.height,
        box_count: meme.box_count,
      }));

      console.log(`✅ Selected ${selectedMemes.length} meme templates`);

      return {
        templates: selectedMemes,
        searchCriteria: {
          categories: inputData.frustrations.map(f => f.category),
          mood: inputData.overallMood,
          style: inputData.suggestedMemeStyle,
        },
        totalAvailable: allMemes.length,
        matchingStrategy,
        analysis: {
          message: `Found ${selectedMemes.length} great templates! Top pick: "${selectedMemes[0]?.name}"`,
        },
      };
    } catch (error) {
      console.error('Error finding base memes:', error);
      throw new Error('Failed to search for meme templates');
    }
  },
});
