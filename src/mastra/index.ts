import { Mastra } from '@mastra/core';
import { storage } from './memory';

export const mastra = new Mastra({
  storage,
  agents: {},
  workflows: {},
  telemetry: {
    enabled: true,
  },
});