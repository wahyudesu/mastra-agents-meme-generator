import { Mastra } from '@mastra/core';
import { memeGeneratorAgent } from './agents/meme-generator';

export const mastra = new Mastra({
  agents: {
    memeGenerator: memeGeneratorAgent
  },
  // Disable telemetry to prevent storage initialization errors
  telemetry: {
    enabled: false
  }
});
        