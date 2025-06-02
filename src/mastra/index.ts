import { Mastra } from '@mastra/core';
import { storage } from './memory';
import { memeGeneratorAgent } from './agents/meme-generator';

export const mastra = new Mastra({
  storage,
  agents: {
    memeGenerator: memeGeneratorAgent
  },
  // Re-enable telemetry now that storage is configured
  telemetry: {
    enabled: true
  }
});
        