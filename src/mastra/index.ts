import { Mastra } from '@mastra/core';
import { storage } from './memory';
import { testWorkflow } from './workflows/test-workflow';

export const mastra = new Mastra({
  storage,
  agents: {},
  workflows: {
    'test-workflow': testWorkflow,
  },
  telemetry: {
    enabled: true,
  },
});