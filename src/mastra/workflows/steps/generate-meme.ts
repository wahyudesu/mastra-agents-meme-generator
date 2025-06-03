import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { memeTemplateSchema, captionsSchema } from '../schemas';

export const generateMemeStep = createStep({
  id: 'generate-meme',
  description:
    "Create a meme using imgflip's API with the selected template and captions",
  inputSchema: z.object({
    baseTemplate: memeTemplateSchema,
    captions: captionsSchema,
  }),
  outputSchema: z.object({
    imageGenerated: z.boolean(),
    imageUrl: z.string(),
    pageUrl: z.string().optional(),
    captions: z.object({
      topText: z.string(),
      bottomText: z.string(),
    }),
    baseTemplate: z.string(),
    memeStyle: z.string(),
    humorLevel: z.string(),
    analysis: z.object({
      message: z.string(),
    }),
  }),
  execute: async ({ inputData }) => {
    try {
      console.log(`🎨 Creating meme using imgflip API...`);

      console.log(
        `🖼️  Template: "${inputData.baseTemplate.name}" (ID: ${inputData.baseTemplate.id})`,
      );
      console.log(`📝 Top text: "${inputData.captions.topText}"`);
      console.log(`📝 Bottom text: "${inputData.captions.bottomText}"`);

      // Check if imgflip credentials are available (optional for basic usage)
      const username = process.env.IMGFLIP_USERNAME;
      const password = process.env.IMGFLIP_PASSWORD;

      let finalUsername: string;
      let finalPassword: string;

      if (!username || !password) {
        console.warn(
          '⚠️ IMGFLIP_USERNAME or IMGFLIP_PASSWORD not found in environment variables',
        );
        console.warn(
          '⚠️ Using default imgflip_hubot account (may be rate limited or fail)',
        );
        console.warn('⚠️ Please add your imgflip credentials to .env file');
        // Use default fallback
        finalUsername = 'imgflip_hubot';
        finalPassword = 'imgflip_hubot';
      } else {
        console.log(
          '✅ Using custom imgflip credentials from environment variables',
        );
        console.log(`👤 Username: ${username}`);
        finalUsername = username;
        finalPassword = password;
      }

      console.log(`🚀 Generating meme with imgflip API...`);

      // Prepare form data for imgflip API
      const formData = new URLSearchParams();
      formData.append('template_id', inputData.baseTemplate.id);
      formData.append('username', finalUsername);
      formData.append('password', finalPassword);
      formData.append('text0', inputData.captions.topText);
      formData.append('text1', inputData.captions.bottomText);

      // Call imgflip's caption_image API
      let response;
      try {
        response = await fetch('https://api.imgflip.com/caption_image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });
      } catch (fetchError) {
        console.error('Network error when calling imgflip API:', fetchError);
        throw new Error(
          `Network error: Failed to connect to imgflip API. Please check your internet connection.`,
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Imgflip API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });

        throw new Error(
          `Imgflip API error (${response.status}): ${errorText || 'Unknown error'}`,
        );
      }

      const result = await response.json();

      // Check if imgflip API returned success
      if (!result.success) {
        console.error('Imgflip API returned error:', result.error_message);
        throw new Error(
          `Imgflip API error: ${result.error_message || 'Unknown error'}`,
        );
      }

      const imageUrl = result.data.url;
      const pageUrl = result.data.page_url;

      console.log(`✅ Meme generated successfully!`);
      console.log(`🔗 Image URL: ${imageUrl}`);
      if (pageUrl) {
        console.log(`📄 Page URL: ${pageUrl}`);
      }

      // Store the image URL for the publish step
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).lastGeneratedMemeUrl = imageUrl;

      return {
        imageGenerated: true,
        imageUrl,
        pageUrl,
        captions: {
          topText: inputData.captions.topText,
          bottomText: inputData.captions.bottomText,
        },
        baseTemplate: inputData.baseTemplate.name,
        memeStyle: inputData.captions.memeStyle,
        humorLevel: inputData.captions.humorLevel,
        analysis: {
          message: `Your meme is ready! Created "${inputData.baseTemplate.name}" meme with "${inputData.captions.topText}" / "${inputData.captions.bottomText}". View it at: ${imageUrl}`,
        },
      };
    } catch (error) {
      console.error('Error generating meme:', error);
      throw new Error(
        `Failed to generate meme: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },
});
