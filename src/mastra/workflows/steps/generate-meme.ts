import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { memeTemplateSchema, captionsSchema } from "../schemas";

export const generateMemeStep = createStep({
  id: "generate-meme",
  description:
    "Create a meme by adding captions to an existing Imgflip template",
  inputSchema: z.object({
    baseTemplate: memeTemplateSchema,
    captions: captionsSchema,
  }),
  outputSchema: z.object({
    imageGenerated: z.boolean(),
    imageUrl: z.string(),
    pageUrl: z.string(),
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
      console.log(`🎨 Creating meme using Imgflip API...`);

      console.log(
        `🖼️  Using template: "${inputData.baseTemplate.name}" (ID: ${inputData.baseTemplate.id})`,
      );
      console.log(`📝 Top text: "${inputData.captions.topText}"`);
      console.log(`📝 Bottom text: "${inputData.captions.bottomText}"`);

      // Imgflip API credentials (using demo account - you should use your own)
      const IMGFLIP_USERNAME = process.env.IMGFLIP_USERNAME!;
      const IMGFLIP_PASSWORD = process.env.IMGFLIP_PASSWORD!;

      // Call Imgflip caption_image API
      const formData = new FormData();
      formData.append("template_id", inputData.baseTemplate.id);
      formData.append("username", IMGFLIP_USERNAME);
      formData.append("password", IMGFLIP_PASSWORD);
      formData.append("text0", inputData.captions.topText);
      formData.append("text1", inputData.captions.bottomText);

      console.log(`🚀 Calling Imgflip API to caption meme...`);

      let response;
      try {
        response = await fetch("https://api.imgflip.com/caption_image", {
          method: "POST",
          body: formData,
        });
      } catch (fetchError) {
        console.error("Network error when calling Imgflip API:", fetchError);
        throw new Error(
          `Network error: Failed to connect to Imgflip API. Please check your internet connection.`,
        );
      }

      if (!response.ok) {
        throw new Error(
          `Imgflip API error (${response.status}): ${response.statusText}`,
        );
      }

      const result = await response.json();

      if (!result.success) {
        console.error("Imgflip API Error:", result);
        throw new Error(
          `Failed to create meme: ${result.error_message || "Unknown error"}`,
        );
      }

      console.log(`✅ Meme created successfully!`);
      console.log(`🔗 Image URL: ${result.data.url}`);
      console.log(`📄 Page URL: ${result.data.page_url}`);

      // Store the image URL for the publish step
      (global as any).lastGeneratedMemeUrl = result.data.url;

      return {
        imageGenerated: true,
        imageUrl: result.data.url,
        pageUrl: result.data.page_url,
        captions: {
          topText: inputData.captions.topText,
          bottomText: inputData.captions.bottomText,
        },
        baseTemplate: inputData.baseTemplate.name,
        memeStyle: inputData.captions.memeStyle,
        humorLevel: inputData.captions.humorLevel,
        analysis: {
          message: `Your meme is ready! Created "${inputData.baseTemplate.name}" meme with "${inputData.captions.topText}" / "${inputData.captions.bottomText}". The meme is hosted on Imgflip!`,
        },
      };
    } catch (error) {
      console.error("Error generating meme:", error);
      throw new Error(
        `Failed to generate meme: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});
