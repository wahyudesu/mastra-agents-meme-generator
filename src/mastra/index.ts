import { Mastra } from '@mastra/core';
import { storage } from './memory';
import { memeGenerationWorkflow } from './workflows/meme-generation';

export const mastra = new Mastra({
  storage,
  agents: {},
  workflows: {
    'meme-generation': memeGenerationWorkflow,
  },
  telemetry: {
    enabled: true,
  },
});