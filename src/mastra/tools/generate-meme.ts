import { createTool } from '@mastra/core';
import { z } from 'zod';

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
  topText: z.string(),
  bottomText: z.string(),
  memeStyle: z.enum(["classic_format", "reaction", "comparison", "situation", "advice"]),
  humorLevel: z.enum(["mild", "moderate", "spicy"])
});

export const generateMemeTools = createTool({
  id: "generate-meme",
  description: "Create a custom meme using OpenAI image generation inspired by popular meme templates",
  inputSchema: z.object({
    baseTemplate: baseTemplateSchema,
    captions: captionsSchema,
    style: z.enum(["photorealistic", "cartoon", "classic_meme"]).optional().describe("Visual style for the generated meme")
  }),
  execute: async ({ context: { baseTemplate, captions, style } }) => {
    try {
      console.log(`🎨 Creating meme using AI generation...`);
      
      const visualStyle = style || "classic_meme";
      
      console.log(`🖼️  Base template inspiration: "${baseTemplate.name}"`);
      console.log(`📝 Top text: "${captions.topText}"`);
      console.log(`📝 Bottom text: "${captions.bottomText}"`);
      console.log(`🎨 Visual style: ${visualStyle}`);
      
      // Create a detailed prompt that describes the meme concept without copying copyrighted content
      const prompt = `
        Create an original meme image inspired by the concept of "${baseTemplate.name}" with the following text:
        
        Top text: "${captions.topText}"
        Bottom text: "${captions.bottomText}"
        
        Style requirements:
        - Create an original image that captures the essence and humor style of the "${baseTemplate.name}" meme format
        - Add the text as clear, bold, white text with black outline (classic meme font style)
        - Top text positioned at the top, bottom text at the bottom
        - Use a ${visualStyle} visual style
        - Make it look like a professional, shareable internet meme
        - Ensure the image composition supports the ${captions.memeStyle} format
        - Capture ${captions.humorLevel} humor level
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

      // Check if fetch is available
      if (typeof fetch === 'undefined') {
        throw new Error('fetch is not available. Please ensure you are running in a Node.js 18+ environment or install a fetch polyfill.');
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
            size: '1024x1024'
          })
        });
      } catch (fetchError) {
        console.error('Network error when calling OpenAI API:', fetchError);
        throw new Error(`Network error: Failed to connect to OpenAI API. Please check your internet connection. Details: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`);
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
      
      // Don't include the full image URL in the analysis to save tokens
      const imageUrlPreview = imageUrl.startsWith('data:') 
        ? `data:image/png;base64,[${Math.floor(imageUrl.length/1000)}KB base64 data]`
        : imageUrl;
      
      const result = {
        // Don't include the actual imageUrl in the result to save massive tokens
        // The publish tool can still access it through a different mechanism
        imageGenerated: true,
        imageSize: imageUrl.startsWith('data:') ? `${Math.floor(imageUrl.length/1000)}KB` : 'URL',
        captions: {
          topText: captions.topText,
          bottomText: captions.bottomText
        },
        baseTemplate: baseTemplate.name,
        visualStyle,
        memeStyle: captions.memeStyle,
        humorLevel: captions.humorLevel,
        analysis: {
          message: `Your meme is ready! Created ${visualStyle} style meme with "${captions.topText}" / "${captions.bottomText}". Now publishing it for easy sharing...`
        }
      };

      // Store the actual image URL separately for the publish step
      // This is a workaround to avoid including massive base64 data in the conversation
      (global as any).lastGeneratedMemeUrl = imageUrl;

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error generating meme:', error);
      return {
        success: false,
        error: `Failed to generate meme: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      };
    }
  }
}); 