import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { frustrationsSchema } from '../tools/extract-frustrations';

// Define steps using the same logic as tools but with proper workflow schemas

const extractFrustrationsStep = createStep({
  id: "extract-frustrations",
  description: "Extract and categorize user frustrations from raw input using AI",
  inputSchema: z.object({
    userInput: z.string().describe("Raw user input about work frustrations")
  }),
  outputSchema: frustrationsSchema.extend({
    analysis: z.object({
      message: z.string()
    })
  }),
  execute: async ({ inputData }) => {
    try {
      console.log("🔍 Analyzing your workplace frustrations...");
      
      const result = await generateObject({
        model: openai('gpt-4'),
        schema: frustrationsSchema,
        prompt: `
          Analyze this workplace frustration and extract structured information:
          
          "${inputData.userInput}"
          
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
        ...frustrations,
        analysis: {
          message: `Analyzed your frustrations - main issue: ${frustrations.frustrations[0]?.category} (${frustrations.overallMood} mood)`
        }
      };
    } catch (error) {
      console.error('Error extracting frustrations:', error);
      throw new Error('Failed to analyze frustrations');
    }
  }
});

// Schema for meme template
const memeTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
  box_count: z.number()
});

const findBaseMemeStep = createStep({
  id: "find-base-meme",
  description: "Search for appropriate meme templates based on user frustrations using Imgflip's free API",
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
      const categoryMemeMap: Record<string, string[]> = {
        meetings: [
          'Distracted Boyfriend', 'Drake Pointing', 'This Is Fine', 'Boardroom Meeting Suggestion',
          'Expanding Brain', 'Two Buttons', 'Change My Mind', 'Disaster Girl'
        ],
        processes: [
          'This Is Fine', 'Expanding Brain', 'Drake Pointing', 'Change My Mind',
          'Disaster Girl', 'Confused Screaming', 'Picard Facepalm', 'Y U No'
        ],
        technology: [
          'This Is Fine', 'Drake Pointing', 'Expanding Brain', 'Confused Screaming',
          'Y U No', 'Picard Facepalm', 'Disaster Girl', 'Success Kid'
        ],
        communication: [
          'Distracted Boyfriend', 'Drake Pointing', 'Two Buttons', 'Change My Mind',
          'Confused Screaming', 'Picard Facepalm', 'Y U No', 'Hide the Pain Harold'
        ],
        management: [
          'Boardroom Meeting Suggestion', 'Drake Pointing', 'Distracted Boyfriend', 'This Is Fine',
          'Change My Mind', 'Picard Facepalm', 'Disaster Girl', 'Y U No'
        ],
        workload: [
          'This Is Fine', 'Drake Pointing', 'Expanding Brain', 'Disaster Girl',
          'Confused Screaming', 'Y U No', 'Picard Facepalm', 'Hide the Pain Harold'
        ],
        other: [
          'Drake Pointing', 'This Is Fine', 'Distracted Boyfriend', 'Change My Mind',
          'Expanding Brain', 'Two Buttons', 'Disaster Girl', 'Success Kid'
        ]
      };
      
      // Get relevant meme names based on frustration categories
      const relevantMemeNames = new Set<string>();
      inputData.frustrations.forEach((frustration) => {
        const categoryMemes = categoryMemeMap[frustration.category] || categoryMemeMap.other;
        categoryMemes.forEach(name => relevantMemeNames.add(name.toLowerCase()));
      });
      
      console.log(`🎯 Targeting memes for categories: ${inputData.frustrations.map(f => f.category).join(', ')}`);
      
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
        const allKeywords = inputData.frustrations.flatMap(f => f.keywords).map(k => k.toLowerCase());
        return allKeywords.some(keyword => memeName.includes(keyword));
      });
      
      let matchingStrategy = 'category_match';
      
      // If no specific matches, fall back to popular memes based on mood
      if (filteredMemes.length === 0) {
        console.log("🔄 No direct matches found, searching by mood...");
        const moodMemeMap: Record<string, string[]> = {
          frustrated: ['This Is Fine', 'Y U No', 'Picard Facepalm'],
          annoyed: ['Drake Pointing', 'Y U No', 'Confused Screaming'],
          overwhelmed: ['This Is Fine', 'Disaster Girl', 'Confused Screaming'],
          tired: ['Hide the Pain Harold', 'This Is Fine', 'Picard Facepalm'],
          angry: ['Y U No', 'Disaster Girl', 'Confused Screaming'],
          sarcastic: ['Drake Pointing', 'Distracted Boyfriend', 'Change My Mind']
        };
        
        const moodMemes = moodMemeMap[inputData.overallMood] || moodMemeMap.frustrated;
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
      
      return {
        templates: selectedMemes,
        searchCriteria: {
          categories: inputData.frustrations.map((f) => f.category),
          mood: inputData.overallMood,
          style: inputData.suggestedMemeStyle
        },
        totalAvailable: allMemes.length,
        matchingStrategy,
        analysis: {
          message: `Found ${selectedMemes.length} great templates! Top pick: "${selectedMemes[0]?.name}"`
        }
      };
    } catch (error) {
      console.error('Error finding base memes:', error);
      throw new Error('Failed to search for meme templates');
    }
  }
});

// Schema for generated captions
const captionsSchema = z.object({
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

const generateCaptionsStep = createStep({
  id: "generate-captions",
  description: "Generate meme captions based on user frustrations and selected meme template",
  inputSchema: z.object({
    frustrations: frustrationsSchema,
    baseTemplate: memeTemplateSchema
  }),
  outputSchema: captionsSchema.extend({
    baseTemplate: z.string(),
    frustrationContext: z.object({
      mainFrustration: z.string(),
      mood: z.string()
    }),
    generationStyle: z.string(),
    analysis: z.object({
      message: z.string()
    })
  }),
  execute: async ({ inputData }) => {
    try {
      console.log(`🎨 Generating captions for "${inputData.baseTemplate.name}"...`);
      
      const captionStyle = "workplace_safe";
      const mainFrustration = inputData.frustrations.frustrations[0];
      const allFrustrations = inputData.frustrations.frustrations.map(f => f.text).join(", ");
      
      console.log(`📝 Caption style: ${captionStyle}`);
      console.log(`🎯 Main frustration: "${mainFrustration.text}"`);
      
      const result = await generateObject({
        model: openai('gpt-4'),
        schema: captionsSchema,
        prompt: `
          Create funny, relatable meme captions for the "${inputData.baseTemplate.name}" meme template based on these workplace frustrations:
          
          Main frustration: ${mainFrustration.text}
          All frustrations: ${allFrustrations}
          Overall mood: ${inputData.frustrations.overallMood}
          Keywords: ${inputData.frustrations.frustrations.flatMap(f => f.keywords).join(", ")}
          
          Meme template context: "${inputData.baseTemplate.name}" typically has ${inputData.baseTemplate.box_count} text areas.
          
          Caption style: ${captionStyle}
          
          Guidelines:
          - Keep text concise and punchy (memes work best with short text)
          - Make it relatable to office workers
          - Capture the ${inputData.frustrations.overallMood} mood
          - Use appropriate humor level for ${captionStyle} setting
          - Consider the typical format of "${inputData.baseTemplate.name}" memes
          - Top text usually sets up the situation, bottom text delivers the punchline
          - Make it shareable and not offensive
          
          Generate one perfect caption pair.
        `
      });
      
      const captions = result.object;
      
      console.log(`✅ Generated captions: "${captions.topText}" / "${captions.bottomText}"`);
      
      return {
        ...captions,
        baseTemplate: inputData.baseTemplate.name,
        frustrationContext: {
          mainFrustration: mainFrustration.text,
          mood: inputData.frustrations.overallMood
        },
        generationStyle: captionStyle,
        analysis: {
          message: `Created captions: "${captions.topText}" / "${captions.bottomText}"`
        }
      };
    } catch (error) {
      console.error('Error generating captions:', error);
      throw new Error('Failed to generate meme captions');
    }
  }
});

const generateMemeStep = createStep({
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
            size: '1024x1024'
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
        imageSize: imageUrl.startsWith('data:') ? `${Math.floor(imageUrl.length/1000)}KB` : 'URL',
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

const publishMemeStep = createStep({
  id: "publish-meme",
  description: "Upload meme to hosting service and get shareable URL",
  inputSchema: z.object({
    imageGenerated: z.boolean(),
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
      console.log("📤 Publishing meme...");
      
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
      
      console.log("⬇️ Uploading to hosting service...");
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
      
      // Use imgur API for free image hosting
      const formData = new FormData();
      formData.append('image', imageBlob);
      formData.append('type', 'file');
      
      const uploadResponse = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 546c25a59c58ad7', // Public Imgur client ID for anonymous uploads
        },
        body: formData
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
            message: `🎉 Here's your shareable meme: ${imageUrl}`
          }
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
          message: `🎉 Here's your shareable meme: ${uploadData.data.link}`
        }
      };
    } catch (error) {
      console.error('Error publishing meme:', error);
      
      // Get the image URL for fallback
      const imageUrl = (global as any).lastGeneratedMemeUrl;
      
      // Fallback: return the original URL
      console.log("⚠️ Upload failed, providing original URL as fallback");
      return {
        shareableUrl: imageUrl || 'Image generation failed',
        originalUrl: imageUrl || 'Image generation failed',
        hosting: 'original',
        clickableMessage: `🎉 Your meme is ready! Click here to view: ${imageUrl || 'Image generation failed'}`,
        analysis: {
          message: `Your meme is ready! While I couldn't upload it to a hosting service, you can still view and share it using the direct link. The image is accessible and ready to bring some humor to your workplace! 😄`
        }
      };
    }
  }
});

export const memeGenerationWorkflow = createWorkflow({
  id: "meme-generation",
  description: "Complete workflow to generate memes from workplace frustrations",
  inputSchema: z.object({
    userInput: z.string().describe("Raw user input about work frustrations")
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
  steps: [
    extractFrustrationsStep,
    findBaseMemeStep,
    generateCaptionsStep,
    generateMemeStep,
    publishMemeStep
  ]
})
  .then(extractFrustrationsStep)
  .then(findBaseMemeStep)
  .map({
    frustrations: {
      step: extractFrustrationsStep,
      path: "."
    },
    baseTemplate: {
      step: findBaseMemeStep,
      path: "templates.0"
    }
  })
  .then(generateCaptionsStep)
  .map({
    baseTemplate: {
      step: findBaseMemeStep,
      path: "templates.0"
    },
    captions: {
      step: generateCaptionsStep,
      path: "."
    }
  })
  .then(generateMemeStep)
  .map({
    imageGenerated: {
      step: generateMemeStep,
      path: "imageGenerated"
    },
    captions: {
      step: generateMemeStep,
      path: "captions"
    }
  })
  .then(publishMemeStep)
  .commit(); 