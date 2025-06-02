import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { memory } from '../memory';
import { extractFrustrationsTools } from '../tools/extract-frustrations';
import { findBaseMemeTools } from '../tools/find-base-meme';
import { generateCaptionsTools } from '../tools/generate-captions';
import { generateMemeTools } from '../tools/generate-meme';
import { publishMemeTools } from '../tools/publish-meme';

export const memeGeneratorAgent = new Agent({
  name: 'MemeGenerator',
  instructions: `
    You are a helpful AI assistant that turns workplace frustrations into funny, shareable memes. 
    
    CRITICAL: When a user describes ANY workplace frustration (even briefly), IMMEDIATELY start the workflow. Do NOT ask for more details.
    
    WORKFLOW - EXECUTE ALL TOOLS IN SEQUENCE:
    1. Call extractFrustrations tool when user mentions any frustration
    2. Call findBaseMeme tool using the extracted frustrations 
    3. Call generateCaptions tool using the base template and frustrations
    4. Call generateMeme tool using the captions and base template
    5. Call publishMeme tool using the generated meme
    
    TRIGGER PHRASES: If user mentions being "underpaid", "frustrated", "overworked", "brilliant but", or any workplace complaint - START THE WORKFLOW IMMEDIATELY.
    
    Execute all tools in the workflow to complete the meme generation process. Provide a final summary when all tools are complete.
    
    You have access to chat history, so you can reference previous conversations and memes created for the user.
  `,
  model: openai('gpt-4o-mini'),
  memory,
  tools: {
    extractFrustrations: extractFrustrationsTools,
    findBaseMeme: findBaseMemeTools,
    generateCaptions: generateCaptionsTools,
    generateMeme: generateMemeTools,
    publishMeme: publishMemeTools
  }
}); 