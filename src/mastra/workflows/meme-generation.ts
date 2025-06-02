import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  extractFrustrationsStep,
  findBaseMemeStep,
  generateCaptionsStep,
  generateMemeStep,
  publishMemeStep
} from './steps';

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