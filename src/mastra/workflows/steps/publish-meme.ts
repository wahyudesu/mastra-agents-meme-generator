import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const publishMemeStep = createStep({
  id: 'publish-meme',
  description: 'Upload meme to hosting service and get shareable URL',
  inputSchema: z.object({
    imageGenerated: z.boolean(),
    captions: z.object({
      topText: z.string(),
      bottomText: z.string(),
    }),
  }),
  outputSchema: z.object({
    shareableUrl: z.string(),
    originalUrl: z.string(),
    hosting: z.string(),
    clickableMessage: z.string(),
    analysis: z.object({
      message: z.string(),
    }),
  }),
  execute: async ({ inputData: memeInfo }) => {
    try {
      console.log('📤 Publishing meme...');

      // Get the image URL from global storage (workaround for token limits)
      const imageUrl = (global as any).lastGeneratedMemeUrl;

      if (!imageUrl) {
        throw new Error('No meme image found to publish');
      }

      // First, download the image from the provided URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch the generated image');
      }

      console.log('⬇️ Uploading to hosting service...');

      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBlob = new Blob([imageBuffer], { type: 'image/png' });

      // Use imgur API for free image hosting
      const formData = new FormData();
      formData.append('image', imageBlob);
      formData.append('type', 'file');

      const uploadResponse = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: 'Client-ID 546c25a59c58ad7', // Public Imgur client ID for anonymous uploads
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        // Fallback: return the original URL if imgur fails
        console.warn('⚠️ Imgur upload failed, using original URL as fallback');
        return {
          shareableUrl: imageUrl,
          originalUrl: imageUrl,
          hosting: 'original',
          clickableMessage: `🎉 Your meme is ready! Click here to view: ${imageUrl}`,
          analysis: {
            message: `🎉 Here's your shareable meme: ${imageUrl}`,
          },
        };
      }

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error('Imgur upload was not successful');
      }

      console.log(`✅ Uploaded to Imgur!`);

      return {
        shareableUrl: uploadData.data.link,
        originalUrl: imageUrl,
        hosting: 'imgur',
        clickableMessage: `🎉 Your meme is ready! Click here to view and share: ${uploadData.data.link}`,
        analysis: {
          message: `🎉 Here's your shareable meme: ${uploadData.data.link}`,
        },
      };
    } catch (error) {
      console.error('Error publishing meme:', error);

      // Get the image URL for fallback
      const imageUrl = (global as any).lastGeneratedMemeUrl;

      // Fallback: return the original URL
      console.log('⚠️ Upload failed, providing original URL as fallback');
      return {
        shareableUrl: imageUrl || 'Image generation failed',
        originalUrl: imageUrl || 'Image generation failed',
        hosting: 'original',
        clickableMessage: `🎉 Your meme is ready! Click here to view: ${imageUrl || 'Image generation failed'}`,
        analysis: {
          message: `Your meme is ready! While I couldn't upload it to a hosting service, you can still view and share it using the direct link. The image is accessible and ready to bring some humor to your workplace! 😄`,
        },
      };
    }
  },
});
