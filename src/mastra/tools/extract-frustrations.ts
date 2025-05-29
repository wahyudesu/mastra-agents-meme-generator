import { createTool } from '@mastra/core';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Schema for extracted frustrations
export const frustrationsSchema = z.object({
  frustrations: z.array(z.object({
    text: z.string().describe("The specific frustration mentioned"),
    category: z.enum([
      "meetings", 
      "processes", 
      "technology", 
      "communication", 
      "management", 
      "workload", 
      "other"
    ]).describe("Category of the frustration"),
    severity: z.enum([
      "mild", 
      "moderate", 
      "severe"
    ]).describe("How severe this frustration is"),
    department: z.enum([
      "engineering", 
      "sales", 
      "marketing", 
      "hr", 
      "finance", 
      "operations", 
      "general"
    ]).describe("Which department this frustration relates to"),
    keywords: z.array(z.string()).describe("Key words that could be used for meme search")
  })),
  overallMood: z.enum([
    "frustrated", 
    "annoyed", 
    "overwhelmed", 
    "tired", 
    "angry", 
    "sarcastic"
  ]).describe("Overall emotional tone"),
  suggestedMemeStyle: z.enum([
    "classic", 
    "modern", 
    "corporate", 
    "developer", 
    "meeting", 
    "remote-work"
  ]).describe("Suggested meme style based on frustrations")
});

export const extractFrustrationsTools = createTool({
  id: "extract-frustrations",
  description: "Extract and categorize user frustrations from raw input using AI",
  inputSchema: z.object({
    userInput: z.string().describe("Raw user input about work frustrations")
  }),
  execute: async ({ context: { userInput } }) => {
    try {
      console.log("🔍 Analyzing your workplace frustrations...");
      
      const result = await generateObject({
        model: openai('gpt-4'),
        schema: frustrationsSchema,
        prompt: `
          Analyze this workplace frustration and extract structured information:
          
          "${userInput}"
          
          Extract:
          - Individual frustrations with categories (meetings, processes, technology, communication, management, workload, other)
          - Overall mood (frustrated, annoyed, overwhelmed, tired, angry, sarcastic)
          - Keywords for each frustration
          - Suggested meme style
          
          Keep analysis concise and focused.
        `
      });
      
      const frustrations = result.object;
      
      console.log(`✅ Found ${frustrations.frustrations.length} frustrations, mood: ${frustrations.overallMood}`);
      
      return {
        success: true,
        data: {
          ...frustrations,
          analysis: {
            message: `Analyzed your frustrations - main issue: ${frustrations.frustrations[0]?.category} (${frustrations.overallMood} mood)`
          }
        }
      };
    } catch (error) {
      console.error('Error extracting frustrations:', error);
      return {
        success: false,
        error: 'Failed to analyze frustrations',
        data: null
      };
    }
  }
}); 