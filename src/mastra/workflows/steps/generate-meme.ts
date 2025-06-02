import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { memeTemplateSchema, captionsSchema } from '../schemas';

export const generateMemeStep = createStep({
  id: "generate-meme",
  description: "Create a custom meme using OpenAI image generation inspired by popular meme templates",
  inputSchema: z.object({
    baseTemplate: memeTemplateSchema,
    captions: captionsSchema
  }),
  outputSchema: z.object({
    imageGenerated: z.boolean(),
    imageSize: z.string(),
    captions: z.object({
      topText: z.string(),
      bottomText: z.string()
    }),
    baseTemplate: z.string(),
    visualStyle: z.string(),
    memeStyle: z.string(),
    humorLevel: z.string(),
    analysis: z.object({
      message: z.string()
    })
  }),
  execute: async ({ inputData }) => {
    try {
      console.log(`🎨 Creating meme using AI generation...`);
      
      const visualStyle = "classic_meme";
      
      console.log(`🖼️  Base template inspiration: "${inputData.baseTemplate.name}"`);
      console.log(`📝 Top text: "${inputData.captions.topText}"`);
      console.log(`📝 Bottom text: "${inputData.captions.bottomText}"`);
      console.log(`🎨 Visual style: ${visualStyle}`);
      
      // Create a detailed prompt that describes the meme concept
      const prompt = `
        Create an original meme image inspired by the concept of "${inputData.baseTemplate.name}" with the following text:
        
        Top text: "${inputData.captions.topText}"
        Bottom text: "${inputData.captions.bottomText}"
        
        Style requirements:
        - Create an original image that captures the essence and humor style of the "${inputData.baseTemplate.name}" meme format
        - Add the text as clear, bold, white text with black outline (classic meme font style)
        - Top text positioned at the top, bottom text at the bottom
        - Use a ${visualStyle} visual style
        - Make it look like a professional, shareable internet meme
        - Ensure the image composition supports the ${inputData.captions.memeStyle} format
        - Capture ${inputData.captions.humorLevel} humor level
        - Make the text highly readable and properly sized
        - Create original characters/scenes that convey the same type of humor as the template
        
        The result should be a completely original meme that people would want to share on social media.
        Focus on creating relatable workplace humor that captures the frustration in a funny way.
      `;

      console.log(`🚀 Generating meme with gpt-image-1...`);

      // Check if API key is available
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.');
      }

      // Validate and potentially trim the prompt for gpt-image-1 (max ~4000 characters)
      let finalPrompt = prompt;
      if (prompt.length > 3500) {
        console.warn('⚠️ Prompt is long, trimming to fit gpt-image-1 limits...');
        finalPrompt = prompt.substring(0, 3500) + '...';
      }

      // Use OpenAI's image generation endpoint with proper parameters
      let response;
      try {
        response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: finalPrompt,
            size: '1024x1024',
            response_format: 'url' // Ensure we get URLs, not base64
          })
        });
      } catch (fetchError) {
        console.error('Network error when calling OpenAI API:', fetchError);
        throw new Error(`Network error: Failed to connect to OpenAI API. Please check your internet connection.`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }
        
        console.error('OpenAI API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || errorText || 'Unknown error'}`);
      }

      const imageData = await response.json();
      
      // Handle both URL and base64 responses
      let imageUrl;
      if (imageData.data[0].url) {
        imageUrl = imageData.data[0].url;
      } else if (imageData.data[0].b64_json) {
        // If we get base64, we'll need to handle it differently
        imageUrl = `data:image/png;base64,${imageData.data[0].b64_json}`;
      } else {
        throw new Error('No image URL or base64 data received from OpenAI');
      }

      console.log(`✅ Meme generated successfully!`);
      
      // Store the actual image URL separately for the publish step
      // This is a workaround to avoid including massive base64 data in the conversation
      (global as any).lastGeneratedMemeUrl = imageUrl;

      return {
        imageGenerated: true,
        imageSize: imageUrl.startsWith('data:') ? 'base64' : 'URL',
        captions: {
          topText: inputData.captions.topText,
          bottomText: inputData.captions.bottomText
        },
        baseTemplate: inputData.baseTemplate.name,
        visualStyle,
        memeStyle: inputData.captions.memeStyle,
        humorLevel: inputData.captions.humorLevel,
        analysis: {
          message: `Your meme is ready! Created ${visualStyle} style meme with "${inputData.captions.topText}" / "${inputData.captions.bottomText}". Now publishing it for easy sharing...`
        }
      };
    } catch (error) {
      console.error('Error generating meme:', error);
      throw new Error(`Failed to generate meme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}); 