import { z } from 'zod';

// Schema for generated captions
export const captionsSchema = z.object({
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