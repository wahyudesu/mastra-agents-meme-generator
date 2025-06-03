import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const publishMemeStep = createStep({
  id: "publish-meme",
  description: "Return the shareable meme URL from Imgflip",
  inputSchema: z.object({
    imageGenerated: z.boolean(),
    imageUrl: z.string(),
    pageUrl: z.string(),
    captions: z.object({
      topText: z.string(),
      bottomText: z.string()
    })
  }),
  outputSchema: z.object({
    shareableUrl: z.string(),
    originalUrl: z.string(),
    hosting: z.string(),
    clickableMessage: z.string(),
    analysis: z.object({
      message: z.string()
    })
  }),
  execute: async ({ inputData: memeInfo }) => {
    try {
      console.log("📤 Meme is already hosted on Imgflip!");
      
      // The meme is already hosted on Imgflip, so we just need to return the URLs
      const imageUrl = memeInfo.imageUrl;
      const pageUrl = memeInfo.pageUrl;
      
      console.log(`✅ Meme ready to share!`);
      console.log(`🖼️ Direct image: ${imageUrl}`);
      console.log(`📄 Imgflip page: ${pageUrl}`);
      
      return {
        shareableUrl: imageUrl,
        originalUrl: imageUrl,
        hosting: 'imgflip',
        clickableMessage: `🎉 Your meme is ready! View it here: ${imageUrl}`,
        analysis: {
          message: `🎉 Here's your meme: ${imageUrl}`
        }
      };
    } catch (error) {
      console.error('Error in publish step:', error);
      throw new Error(`Failed to publish meme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}); 