import { createTool } from '@mastra/core';
import { z } from 'zod';
import { frustrationsSchema } from './extract-frustrations';

// Schema for meme template
const memeTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
  box_count: z.number()
});

// Type for frustrations data
type FrustrationsData = z.infer<typeof frustrationsSchema>;

export const findBaseMemeTools = createTool({
  id: "find-base-meme",
  description: "Search for appropriate meme templates based on user frustrations using Imgflip's free API",
  inputSchema: z.object({
    frustrations: frustrationsSchema,
    style: z.string().optional().describe("Preferred meme style")
  }),
  execute: async ({ context: { frustrations, style } }) => {
    try {
      console.log("🔍 Searching for the perfect meme templates...");
      
      // Get popular memes from Imgflip's free API
      const response = await fetch('https://api.imgflip.com/get_memes');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch memes from Imgflip');
      }
      
      const allMemes = data.data.memes;
      console.log(`📚 Found ${allMemes.length} available meme templates`);
      
      // Enhanced mapping of frustration categories to relevant meme templates
      // Using actual popular meme names from Imgflip
      const categoryMemeMap: Record<string, string[]> = {
        meetings: [
          'Distracted Boyfriend', 'Drake Pointing', 'This Is Fine', 'Boardroom Meeting Suggestion',
          'Expanding Brain', 'Two Buttons', 'Change My Mind', 'Disaster Girl',
          'Hide the Pain Harold', 'Awkward Moment Sealion'
        ],
        processes: [
          'This Is Fine', 'Expanding Brain', 'Drake Pointing', 'Change My Mind',
          'Disaster Girl', 'Confused Screaming', 'Picard Facepalm', 'Y U No',
          'First World Problems', 'Frustrated Boromir'
        ],
        technology: [
          'This Is Fine', 'Drake Pointing', 'Expanding Brain', 'Confused Screaming',
          'Y U No', 'Picard Facepalm', 'Disaster Girl', 'Programmer Humor',
          'Success Kid', 'Frustrated Boromir'
        ],
        communication: [
          'Distracted Boyfriend', 'Drake Pointing', 'Two Buttons', 'Change My Mind',
          'Confused Screaming', 'Picard Facepalm', 'Y U No', 'Awkward Moment Sealion',
          'Hide the Pain Harold', 'First World Problems'
        ],
        management: [
          'Boardroom Meeting Suggestion', 'Drake Pointing', 'Distracted Boyfriend', 'This Is Fine',
          'Change My Mind', 'Picard Facepalm', 'Disaster Girl', 'Y U No',
          'Hide the Pain Harold', 'Frustrated Boromir'
        ],
        workload: [
          'This Is Fine', 'Drake Pointing', 'Expanding Brain', 'Disaster Girl',
          'Confused Screaming', 'Y U No', 'Picard Facepalm', 'First World Problems',
          'Hide the Pain Harold', 'Frustrated Boromir'
        ],
        other: [
          'Drake Pointing', 'This Is Fine', 'Distracted Boyfriend', 'Change My Mind',
          'Expanding Brain', 'Two Buttons', 'Disaster Girl', 'Success Kid'
        ]
      };
      
      // Get relevant meme names based on frustration categories
      const relevantMemeNames = new Set<string>();
      frustrations.frustrations.forEach((frustration) => {
        const categoryMemes = categoryMemeMap[frustration.category] || categoryMemeMap.other;
        categoryMemes.forEach(name => relevantMemeNames.add(name.toLowerCase()));
      });
      
      console.log(`🎯 Targeting memes for categories: ${frustrations.frustrations.map(f => f.category).join(', ')}`);
      
      // Enhanced filtering with fuzzy matching
      let filteredMemes = allMemes.filter((meme: any) => {
        const memeName = meme.name.toLowerCase();
        
        // Direct name matching
        if (Array.from(relevantMemeNames).some(relevantName => 
          memeName.includes(relevantName) || relevantName.includes(memeName)
        )) {
          return true;
        }
        
        // Keyword matching from frustrations
        const allKeywords = frustrations.frustrations.flatMap(f => f.keywords).map(k => k.toLowerCase());
        return allKeywords.some(keyword => memeName.includes(keyword));
      });
      
      let matchingStrategy = 'category_match';
      
      // If no specific matches, fall back to popular memes based on mood
      if (filteredMemes.length === 0) {
        console.log("🔄 No direct matches found, searching by mood...");
        const moodMemeMap: Record<string, string[]> = {
          frustrated: ['This Is Fine', 'Y U No', 'Frustrated Boromir', 'Picard Facepalm'],
          annoyed: ['Drake Pointing', 'Y U No', 'Confused Screaming', 'Hide the Pain Harold'],
          overwhelmed: ['This Is Fine', 'Disaster Girl', 'Confused Screaming', 'First World Problems'],
          tired: ['Hide the Pain Harold', 'This Is Fine', 'Picard Facepalm', 'First World Problems'],
          angry: ['Y U No', 'Frustrated Boromir', 'Disaster Girl', 'Confused Screaming'],
          sarcastic: ['Drake Pointing', 'Distracted Boyfriend', 'Change My Mind', 'Success Kid']
        };
        
        const moodMemes = moodMemeMap[frustrations.overallMood] || moodMemeMap.frustrated;
        filteredMemes = allMemes.filter((meme: any) => 
          moodMemes.some(moodMeme => 
            meme.name.toLowerCase().includes(moodMeme.toLowerCase())
          )
        );
        matchingStrategy = 'mood_match';
      }
      
      // Final fallback to most popular memes
      if (filteredMemes.length === 0) {
        console.log("🔄 Using popular memes as fallback...");
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
        box_count: meme.box_count
      }));
      
      console.log(`✅ Selected ${selectedMemes.length} meme templates`);
      
      const searchResults = {
        templates: selectedMemes,
        searchCriteria: {
          categories: frustrations.frustrations.map((f) => f.category),
          mood: frustrations.overallMood,
          style: style || frustrations.suggestedMemeStyle
        },
        totalAvailable: allMemes.length,
        matchingStrategy,
        analysis: {
          message: `Found ${selectedMemes.length} great templates! Top pick: "${selectedMemes[0]?.name}"`
        }
      };
      
      return {
        success: true,
        data: searchResults
      };
    } catch (error) {
      console.error('Error finding base memes:', error);
      return {
        success: false,
        error: 'Failed to search for meme templates',
        data: null
      };
    }
  }
}); 